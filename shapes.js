const SHAPE_IMAGES = {
    "עכביש": "spider.jpg", "טרנטולה": "spider.jpg",
    "פרפר": "butterfly.jpg", "שפירית": "butterfly.jpg", "עש": "butterfly.jpg",
    "אריה": "lion.jpg", "לביאה": "lion.jpg",
    "זאב": "wolf.jpg", "כלב": "dog.jpg", "כלבלב": "dog.jpg",
    "מדוזה": "jellyfish.jpg",
    "דוב": "bear.jpg",
    "פיל": "elephant.jpg",
    "חתול": "cat.jpg", "חתולה": "cat.jpg",
    "ציפור": "bird.jpg", "נשר": "bird.jpg", "יונה": "bird.jpg",
    
    // Fallback shape if not found
    "default": "spider.jpg"
};

// Async function to load image and extract point cloud
function getShapeForWordAsync(word) {
    return new Promise((resolve) => {
        if (!word) return resolve(null);
        const cleanWord = word.replace(/\s+/g, '').toLowerCase();
        
        let targetImg = SHAPE_IMAGES["default"];
        
        // Exact match
        if (SHAPE_IMAGES[cleanWord]) {
            targetImg = SHAPE_IMAGES[cleanWord];
        } else {
            // Partial match
            for (const key in SHAPE_IMAGES) {
                if (key !== "default" && cleanWord.includes(key)) {
                    targetImg = SHAPE_IMAGES[key];
                    break;
                }
            }
        }
        
        if (!targetImg) return resolve(null);
        
        const img = new Image();
        img.crossOrigin = "Anonymous"; // just in case
        img.onload = () => {
            const size = 256; // Higher resolution for better line art detail
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            
            // Draw image to fit canvas
            ctx.drawImage(img, 0, 0, size, size);
            
            // Read pixels
            const imgData = ctx.getImageData(0, 0, size, size).data;
            const points = [];
            
            // Grid sampling — step 3 gives a good density for 256x256
            const step = 3;
            
            for (let y = 0; y < size; y += step) {
                for (let x = 0; x < size; x += step) {
                    const r = imgData[(y * size + x) * 4];
                    const g = imgData[(y * size + x) * 4 + 1];
                    const b = imgData[(y * size + x) * 4 + 2];
                    const a = imgData[(y * size + x) * 4 + 3];
                    
                    // For line art: detect white/bright lines on black background.
                    // Low threshold (20) ensures faint lines are picked up.
                    const brightness = (r + g + b) / 3;
                    if (a > 20 && brightness > 20) { 
                        // Normalize from 0..size to -0.5..0.5
                        points.push([
                            (x / size) - 0.5,
                            (y / size) - 0.5
                        ]);
                    }
                }
            }
            
            resolve(points.length > 0 ? points : null);
        };
        img.onerror = () => {
            console.error("Failed to load silhouette:", targetImg);
            resolve(null);
        };
        img.src = "assets/silhouettes/" + targetImg;
    });
}
