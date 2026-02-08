/**
 * Script to compress all images in the customer_documents Supabase bucket
 * 
 * Usage: node scripts/compress-bucket-images.mjs
 * 
 * Requirements:
 * - SUPABASE_SERVICE_ROLE_KEY in .env.local
 * - NEXT_PUBLIC_SUPABASE_URL in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env.local
function loadEnv() {
  const envPath = resolve(__dirname, '..', '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return envVars;
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'customer-documents';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Image extensions to process
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

function isImageFile(filename) {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return IMAGE_EXTENSIONS.includes(ext);
}

async function compressImage(buffer, filename) {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  const originalSize = buffer.length;
  const ONE_MB = 1024 * 1024;
  const TARGET_SIZE = 500 * 1024; // 500KB target for large files
  
  // For files under 1MB, use standard compression
  if (originalSize < ONE_MB) {
    let sharpInstance = sharp(buffer);
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return sharpInstance.jpeg({ quality: 80, progressive: true }).toBuffer();
      case '.png':
        return sharpInstance.png({ quality: 80, compressionLevel: 8 }).toBuffer();
      case '.webp':
        return sharpInstance.webp({ quality: 80 }).toBuffer();
      default:
        return buffer;
    }
  }
  
  // For files >= 1MB, use aggressive compression to target 500KB
  console.log(`   🔄 Large file detected, targeting ${(TARGET_SIZE / 1024).toFixed(0)}KB max output`);
  
  let quality = 70;
  let compressedBuffer = buffer;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (compressedBuffer.length > TARGET_SIZE && quality >= 20 && attempts < maxAttempts) {
    attempts++;
    let sharpInstance = sharp(buffer);
    
    // Also resize if quality alone isn't enough
    if (attempts > 5) {
      const metadata = await sharp(buffer).metadata();
      const scale = 0.8 - (attempts - 5) * 0.1; // Reduce size progressively
      sharpInstance = sharpInstance.resize(Math.round(metadata.width * scale));
    }
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        compressedBuffer = await sharpInstance.jpeg({ quality, progressive: true }).toBuffer();
        break;
      case '.png':
        // Convert PNG to JPEG for better compression on large files
        compressedBuffer = await sharpInstance.jpeg({ quality, progressive: true }).toBuffer();
        break;
      case '.webp':
        compressedBuffer = await sharpInstance.webp({ quality }).toBuffer();
        break;
      default:
        return buffer;
    }
    
    console.log(`   📉 Attempt ${attempts}: quality=${quality}, size=${(compressedBuffer.length / 1024).toFixed(0)}KB`);
    quality -= 10;
  }
  
  return compressedBuffer;
}

async function listAllFiles(path = '') {
  const allFiles = [];
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(path, { limit: 1000 });
  
  if (error) {
    console.error(`Error listing files in ${path}:`, error.message);
    return allFiles;
  }
  
  for (const item of data || []) {
    const fullPath = path ? `${path}/${item.name}` : item.name;
    
    if (item.id === null) {
      // This is a folder, recurse into it
      const subFiles = await listAllFiles(fullPath);
      allFiles.push(...subFiles);
    } else {
      // This is a file
      allFiles.push({ ...item, fullPath });
    }
  }
  
  return allFiles;
}

// Retry helper with exponential backoff
async function withRetry(fn, maxRetries = 3, baseDelayMs = 1000) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        console.log(`   ⚠️  Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

async function processFile(file) {
  const { fullPath, name } = file;
  
  if (!isImageFile(name)) {
    console.log(`⏭️  Skipping non-image: ${fullPath}`);
    return { skipped: true };
  }
  
  console.log(`\n📥 Downloading: ${fullPath}`);
  
  // Download the file with retry
  let downloadData;
  try {
    downloadData = await withRetry(async () => {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(fullPath);
      if (error) throw error;
      return data;
    });
  } catch (err) {
    console.error(`❌ Error downloading ${fullPath}:`, err.message || err);
    return { error: err.message || String(err) };
  }
  
  const originalBuffer = Buffer.from(await downloadData.arrayBuffer());
  const originalSize = originalBuffer.length;
  const ONE_MB = 1024 * 1024;
  
  console.log(`   Original size: ${(originalSize / 1024).toFixed(2)} KB`);
  
  // Skip files under 1MB - they're likely already compressed
  if (originalSize < ONE_MB) {
    console.log(`   ⏭️  Skipping: file is under 1MB (likely already compressed)`);
    return { skipped: true, reason: 'under-threshold' };
  }
  
  // Compress the image
  let compressedBuffer;
  try {
    compressedBuffer = await compressImage(originalBuffer, name);
  } catch (err) {
    console.error(`❌ Error compressing ${fullPath}:`, err.message);
    return { error: err.message };
  }
  
  const compressedSize = compressedBuffer.length;
  const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
  
  console.log(`   Compressed size: ${(compressedSize / 1024).toFixed(2)} KB (${savings}% reduction)`);
  
  // Only upload if we actually saved space
  if (compressedSize >= originalSize) {
    console.log(`   ⏭️  No size reduction, keeping original`);
    return { skipped: true, reason: 'no-reduction' };
  }
  
  // Get content type
  const ext = name.toLowerCase().substring(name.lastIndexOf('.'));
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp'
  };
  
  // Upload compressed image (overwrite) with retry
  try {
    await withRetry(async () => {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fullPath, compressedBuffer, {
          contentType: contentTypes[ext] || 'image/jpeg',
          upsert: true
        });
      if (error) throw error;
    });
  } catch (err) {
    console.error(`❌ Error uploading ${fullPath}:`, err.message || err);
    return { error: err.message || String(err) };
  }
  
  console.log(`   ✅ Uploaded successfully`);
  
  return {
    success: true,
    originalSize,
    compressedSize,
    savings: parseFloat(savings)
  };
}

async function main() {
  console.log('🚀 Starting image compression for bucket:', BUCKET_NAME);
  console.log('');
  
  // List all files in the bucket
  console.log('📂 Listing all files in bucket...');
  const files = await listAllFiles();
  
  console.log(`Found ${files.length} total files\n`);
  
  if (files.length === 0) {
    console.log('No files found in bucket');
    return;
  }
  
  // Process each file
  const results = {
    processed: 0,
    skipped: 0,
    errors: 0,
    totalOriginalSize: 0,
    totalCompressedSize: 0
  };
  
  for (const file of files) {
    const result = await processFile(file);
    
    if (result.error) {
      results.errors++;
    } else if (result.skipped) {
      results.skipped++;
    } else if (result.success) {
      results.processed++;
      results.totalOriginalSize += result.originalSize;
      results.totalCompressedSize += result.compressedSize;
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 COMPRESSION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Processed: ${results.processed} files`);
  console.log(`⏭️  Skipped: ${results.skipped} files`);
  console.log(`❌ Errors: ${results.errors} files`);
  
  if (results.processed > 0) {
    const totalSavings = ((results.totalOriginalSize - results.totalCompressedSize) / results.totalOriginalSize * 100).toFixed(1);
    console.log(`\n💾 Total space saved: ${((results.totalOriginalSize - results.totalCompressedSize) / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Original: ${(results.totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Compressed: ${(results.totalCompressedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Reduction: ${totalSavings}%`);
  }
  
  console.log('\n✨ Done!');
}

main().catch(console.error);
