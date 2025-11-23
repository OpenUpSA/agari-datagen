#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.fasta': 'text/plain',
    '.fa': 'text/plain',
};

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API endpoints
    if (req.url === '/api/schemas') {
        const schemasDir = path.join(__dirname, 'schemas');
        fs.readdir(schemasDir, (err, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to read schemas directory' }));
                return;
            }
            const schemaFiles = files.filter(f => f.endsWith('.json'));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(schemaFiles));
        });
        return;
    }

    if (req.url.startsWith('/api/schema/')) {
        const schemaName = req.url.replace('/api/schema/', '');
        const schemaPath = path.join(__dirname, 'schemas', schemaName);
        fs.readFile(schemaPath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Schema not found' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
        return;
    }

    if (req.url === '/api/fastas') {
        const fastasDir = path.join(__dirname, 'fastas');
        fs.readdir(fastasDir, (err, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to read fastas directory' }));
                return;
            }
            const fastaFiles = files.filter(f => f.endsWith('.fasta') || f.endsWith('.fa'));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(fastaFiles));
        });
        return;
    }

    if (req.url.startsWith('/api/fasta/')) {
        const fastaName = req.url.replace('/api/fasta/', '');
        const fastaPath = path.join(__dirname, 'fastas', fastaName);
        fs.readFile(fastaPath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'FASTA file not found' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(data);
        });
        return;
    }

    // Serve static files
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './generate_dummy_tsv.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Open your browser to http://localhost:${PORT}/`);
});
