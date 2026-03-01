document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    // Mobile Menu Toggle
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Lightbox Functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-lightbox');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    let currentIndex = 0;
    let galleryImages = []; // Array to store src of all gallery images

    // Collect all valid image sources from the gallery
    const updateGalleryImages = () => {
        galleryImages = [];
        const items = document.querySelectorAll('.gallery-item img');
        items.forEach(img => {
            galleryImages.push({
                src: img.src,
                alt: img.alt
            });
        });
    };

    // Open Lightbox
    const openLightbox = (index) => {
        if (galleryImages.length === 0) return;

        currentIndex = index;
        const image = galleryImages[currentIndex];
        lightbox.style.display = "block";
        lightboxImg.src = image.src;
        lightboxImg.alt = image.alt;
        document.body.style.overflow = "hidden";
    };

    // Show Next Image
    const showNext = () => {
        // Check if we need to load more images
        if (currentIndex === galleryImages.length - 1 && imagesLoadedCount < TOTAL_IMAGES) {
            loadMoreImages();
            updateGalleryImages();
            // currentIndex will be pointing to the same numerical index, but the array is now larger
            // So just incrementing is fine
        }

        currentIndex = (currentIndex + 1) % galleryImages.length;
        openLightbox(currentIndex);
    }

    // Show Previous Image
    const showPrev = () => {
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        openLightbox(currentIndex);
    }

    // Initial setup: Add click listeners to all gallery items
    document.querySelectorAll('.gallery-item').forEach((item, index) => {
        // We need to find the actual index among images, not just items (in case some items don't have images)
        // But for simplicity, let's assume all .gallery-item contain images or we filter them.
        // A better approach is to rebuild the list on click or keep the list correct.

        // Let's rely on the image inside.
        const img = item.querySelector('img');
        if (img) {
            item.addEventListener('click', () => {
                updateGalleryImages(); // Refresh list in case of dynamic changes (though static here)
                // Find the index of this image in our collected array
                const clickedIndex = galleryImages.findIndex(image => image.src === img.src);
                if (clickedIndex !== -1) {
                    openLightbox(clickedIndex);
                }
            });
        }
    });

    // Event Listeners for Navigation
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing lightbox
        showNext();
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing lightbox
        showPrev();
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === "block") {
            if (e.key === "ArrowRight") showNext();
            if (e.key === "ArrowLeft") showPrev();
            if (e.key === "Escape") {
                lightbox.style.display = "none";
                document.body.style.overflow = "";
            }
        }
    });

    // Touch Navigation (Swipe)
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
        // Threshold for swipe detection (e.g., 50px)
        if (touchEndX < touchStartX - 50) {
            showNext(); // Swipe Left -> Next
        }
        if (touchEndX > touchStartX + 50) {
            showPrev(); // Swipe Right -> Prev
        }
    };

    // Close the lightbox
    closeBtn.addEventListener('click', () => {
        lightbox.style.display = "none";
        document.body.style.overflow = "";
    });

    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = "none";
            document.body.style.overflow = "";
        }
    });

    // Infinite Scroll Implementation
    const galleryGrid = document.querySelector('.gallery-grid');
    const TOTAL_IMAGES = 93;
    const LOAD_BATCH_SIZE = 12; // Adjusted to 12 for better grid alignment (divisible by 2, 3, 4)
    let imagesLoadedCount = 12;

    // Function to generate image filenames based on index
    // Filenames are 1-indexed: gallery_01.webp, gallery_02.webp, ... gallery_093.webp
    const getImageFilename = (index) => {
        // Adjust for 0-indexed loop but 1-indexed filenames
        const fileIndex = index + 1;
        // Prefix with '0' if single digit, but actually looking at the file list, 
        // it seems standard to use 01, 02... 09, then 010, 011... 093 based on the file list provided earlier
        // Wait, looking at the previous list_dir output:
        // gallery_01.webp ... gallery_09.webp
        // gallery_010.webp ... gallery_093.webp
        // It seems the naming convention is 'gallery_0' + number + '.webp'

        return `gallery_0${fileIndex}.webp`;
    };

    const loadMoreImages = () => {
        const remainingImages = TOTAL_IMAGES - imagesLoadedCount;
        if (remainingImages <= 0) return;

        const imagesToLoad = Math.min(LOAD_BATCH_SIZE, remainingImages);
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < imagesToLoad; i++) {
            const imgIndex = imagesLoadedCount + i;
            const filename = getImageFilename(imgIndex);

            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';

            const img = document.createElement('img');
            img.src = `images/gallery/${filename}`;
            img.alt = `Gallery Image ${imgIndex + 1}`;
            img.loading = 'lazy'; // Native lazy loading as well

            // Add click event for lightbox (since these are new elements)
            galleryItem.addEventListener('click', () => {
                // Determine the global index of this image
                // We need to rebuild the galleryImages array or just push to it?
                // The current implementation of openLightbox uses galleryImages array.
                // We should make sure galleryImages is up to date.
                // The simplest way with current logic is to just call updateGalleryImages() 
                // but that queries the DOM every time. 
                // Let's stick to the existing pattern: update list then open.
                updateGalleryImages();
                const clickedIndex = galleryImages.findIndex(image => image.src === img.src);
                if (clickedIndex !== -1) {
                    openLightbox(clickedIndex);
                }
            });

            galleryItem.appendChild(img);
            fragment.appendChild(galleryItem);
        }

        // Append before the loader if it exists, or just to grid
        // We will add a loader element in HTML or create it here?
        // Let's assume we append to galleryGrid.
        galleryGrid.appendChild(fragment);

        imagesLoadedCount += imagesToLoad;

        // Hide loader if all images loaded
        if (imagesLoadedCount >= TOTAL_IMAGES) {
            const loader = document.getElementById('gallery-loader');
            if (loader) loader.style.display = 'none';
        } else {
            // Move loader to the end
            const loader = document.getElementById('gallery-loader');
            if (loader) {
                galleryGrid.appendChild(loader);
            }
        }
    };

    // Intersection Observer for Infinite Scroll
    const loader = document.createElement('div');
    loader.id = 'gallery-loader';
    loader.style.width = '50px'; // Fixed width for horizontal scroll
    loader.style.minWidth = '50px'; // Prevent shrinking
    loader.style.height = '100%'; // Full height
    loader.style.display = 'flex';
    loader.style.alignItems = 'center';
    loader.style.justifyContent = 'center';

    galleryGrid.appendChild(loader);

    const observerOptions = {
        root: galleryGrid, // Watch the scrolling container, not viewport
        rootMargin: '0px 500px 0px 0px', // Load 500px before end (right side)
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadMoreImages();
            }
        });
    }, observerOptions);

    observer.observe(loader);

    // Initial load is handled by the observer seeing the loader immediately 
    // IF the gallery is empty. 
    // BUT we want to start with some images. 
    // If we remove all images from HTML, the loader will be visible and trigger load.
    // That's a good clean approach.

    // Verify captcha is checked
    const form = document.getElementById('form');
    if (form) {
        form.addEventListener('submit', function (e) {
            const hCaptcha = form.querySelector('textarea[name=h-captcha-response]').value;
            if (!hCaptcha) {
                e.preventDefault();
                alert("Please fill out captcha field")
                return
            }
        });
    }

    // Hover Scroll Logic
    const scrollContainer = document.querySelector('.gallery-grid');
    const leftZone = document.querySelector('.scroll-area.left');
    const rightZone = document.querySelector('.scroll-area.right');

    let scrollInterval;
    const SCROLL_DELAY = 600; // Time between scrolls (in ms) to allow smooth animation to finish

    const startScrolling = (direction) => {
        stopScrolling(); // Clear any existing interval

        const scrollStep = () => {
            // Calculate width dynamically in case of resize
            const item = scrollContainer.querySelector('.gallery-item');
            if (!item) return;

            // Get accurate width + gap
            const style = window.getComputedStyle(scrollContainer);
            const gap = parseFloat(style.gap) || 24; // Default to 24px if gap parsing fails
            const scrollAmount = item.offsetWidth + gap;

            scrollContainer.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        };

        // Scroll immediately on hover
        scrollStep();

        // Then continuously scroll at set interval
        scrollInterval = setInterval(scrollStep, SCROLL_DELAY);
    };

    const stopScrolling = () => {
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
    };

    if (leftZone && rightZone) {
        leftZone.addEventListener('mouseenter', () => startScrolling('left'));
        leftZone.addEventListener('mouseleave', stopScrolling);

        rightZone.addEventListener('mouseenter', () => startScrolling('right'));
        rightZone.addEventListener('mouseleave', stopScrolling);
    }
});

