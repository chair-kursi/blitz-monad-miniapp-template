#!/usr/bin/env node

/**
 * Clear Redis Database
 * This script clears all game data from Redis (Upstash)
 */

const https = require('https');

// Redis credentials from .env.local
const REDIS_URL = 'https://choice-tarpon-27967.upstash.io';
const REDIS_TOKEN = 'AW0_AAIncDIwYmE4ODMyMjMwZjg0OTBiODg3ZmUzM2RkZjRiMmZlZXAyMjc5Njc';

async function clearRedis() {
    console.log('🗑️  Clearing Redis database...\n');

    try {
        // Get all keys
        console.log('1️⃣  Fetching all keys...');
        const keys = await redisCommand('KEYS', '*');

        if (!keys || keys.length === 0) {
            console.log('✅ Database is already empty!');
            return;
        }

        console.log(`📊 Found ${keys.length} keys to delete:\n`);
        keys.forEach(key => console.log(`   - ${key}`));
        console.log('');

        // Delete all keys
        console.log('2️⃣  Deleting all keys...');
        for (const key of keys) {
            await redisCommand('DEL', key);
            console.log(`   ✓ Deleted: ${key}`);
        }

        console.log('\n✅ Redis database cleared successfully!');
        console.log('🎉 You can now test with fresh data!\n');

    } catch (error) {
        console.error('❌ Error clearing Redis:', error.message);
        process.exit(1);
    }
}

function redisCommand(command, ...args) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify([command, ...args]);

        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${REDIS_TOKEN}`,
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(REDIS_URL, options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve(response.result);
                } catch (err) {
                    reject(new Error(`Failed to parse response: ${body}`));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

// Run the script
clearRedis();
