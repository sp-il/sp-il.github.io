document.addEventListener('DOMContentLoaded', () => {
    // Auto-update copyright year
    document.getElementById('copyright-year').textContent = new Date().getFullYear();

    // Disable right-click on gallery images and lightbox image
    document.querySelector('.gallery-grid').addEventListener('contextmenu', event => {
        if (event.target.tagName === 'IMG') event.preventDefault();
    });
    document.getElementById('lightbox').addEventListener('contextmenu', event => {
        if (event.target.tagName === 'IMG') event.preventDefault();
    });

    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    // Mobile Menu Toggle
    menuToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isOpen);
    });

    menuToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const isOpen = navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isOpen);
        }
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
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

    // Close Lightbox
    const closeLightbox = () => {
        lightbox.style.display = "none";
        document.body.style.overflow = "";
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
        // Proactively load the next batch when within 3 images of the end,
        // so the DOM is ready before updateGalleryImages() reads it.
        // (IntersectionObserver is too slow for rapid keyboard navigation.)
        if (currentIndex >= galleryImages.length - 3 && imagesLoadedCount < TOTAL_IMAGES) {
            loadMoreImages();
        }
        updateGalleryImages();
        currentIndex = (currentIndex + 1) % galleryImages.length;
        openLightbox(currentIndex);
    }

    // Show Previous Image
    const showPrev = () => {
        updateGalleryImages();
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        openLightbox(currentIndex);
    }

    // Initial setup: Add click listeners to all gallery items
    document.querySelectorAll('.gallery-item').forEach((item) => {
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
            if (e.key === "Escape") closeLightbox();
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
        } else if (touchEndX > touchStartX + 50) {
            showPrev(); // Swipe Right -> Prev
        }
    };

    // Close the lightbox
    closeBtn.addEventListener('click', closeLightbox);

    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Infinite Scroll Implementation
    const galleryGrid = document.querySelector('.gallery-grid');
    const TOTAL_IMAGES = 93;
    const LOAD_BATCH_SIZE = 12; // Adjusted to 12 for better grid alignment (divisible by 2, 3, 4)
    let imagesLoadedCount = 12;

    // Function to generate image filenames based on index
    // Filenames are 1-indexed: gallery_01.webp, gallery_02.webp, ... gallery_093.webp
    const getImageFilename = (index) => {
        const fileIndex = index + 1;
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
                updateGalleryImages();
                const clickedIndex = galleryImages.findIndex(image => image.src === img.src);
                if (clickedIndex !== -1) {
                    openLightbox(clickedIndex);
                }
            });

            galleryItem.appendChild(img);
            fragment.appendChild(galleryItem);
        }

        galleryGrid.appendChild(fragment);

        imagesLoadedCount += imagesToLoad;

        // Move loader to end, or hide it once all images are loaded
        const loaderEl = document.getElementById('gallery-loader');
        if (loaderEl) {
            if (imagesLoadedCount >= TOTAL_IMAGES) {
                loaderEl.style.display = 'none';
            } else {
                galleryGrid.appendChild(loaderEl);
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

    // Form submission via AJAX (fetch) for real success/error feedback
    const form = document.getElementById('form');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const captchaEl = form.querySelector('textarea[name=h-captcha-response]');
            const hCaptcha = captchaEl ? captchaEl.value : '';
            const successMsg = document.getElementById('form-success-message');
            const errorMsg = document.getElementById('form-error-message');

            // Reset any existing messages
            if (successMsg) successMsg.style.display = 'none';
            if (errorMsg) errorMsg.style.display = 'none';

            // Captcha check
            if (!hCaptcha) {
                if (errorMsg) {
                    errorMsg.textContent = 'Please complete the captcha before sending.';
                    errorMsg.style.display = 'block';
                    setTimeout(() => { errorMsg.style.display = 'none'; }, 5000);
                }
                return;
            }

            // Disable button while request is in flight
            const submitBtn = form.querySelector('.btn-submit');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
            }

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: new FormData(form)
                });
                const result = await response.json();

                if (result.success) {
                    form.reset();
                    if (successMsg) {
                        successMsg.style.display = 'block';
                        setTimeout(() => { successMsg.style.display = 'none'; }, 10000);
                    }
                } else {
                    if (errorMsg) {
                        errorMsg.textContent = result.message || 'Something went wrong. Please try again.';
                        errorMsg.style.display = 'block';
                        setTimeout(() => { errorMsg.style.display = 'none'; }, 6000);
                    }
                }
            } catch (err) {
                if (errorMsg) {
                    errorMsg.textContent = 'Network error. Please check your connection and try again.';
                    errorMsg.style.display = 'block';
                    setTimeout(() => { errorMsg.style.display = 'none'; }, 6000);
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Message';
                }
            }
        });
    }

    // Hover Scroll Logic (reuses galleryGrid declared above)
    const leftZone = document.querySelector('.scroll-area.left');
    const rightZone = document.querySelector('.scroll-area.right');

    let scrollInterval;
    const SCROLL_DELAY = 600; // Time between scrolls (in ms) to allow smooth animation to finish

    const startScrolling = (direction) => {
        stopScrolling(); // Clear any existing interval

        const scrollStep = () => {
            // Calculate width dynamically in case of resize
            const item = galleryGrid.querySelector('.gallery-item');
            if (!item) return;

            // Get accurate width + gap
            const style = window.getComputedStyle(galleryGrid);
            const gap = parseFloat(style.gap) || 24; // Default to 24px if gap parsing fails
            const scrollAmount = item.offsetWidth + gap;

            galleryGrid.scrollBy({
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

