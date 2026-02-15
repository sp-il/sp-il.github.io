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
    };

    // Show Next Image
    const showNext = () => {
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
            if (e.key === "Escape") lightbox.style.display = "none";
        }
    });

    // Close the lightbox
    closeBtn.addEventListener('click', () => {
        lightbox.style.display = "none";
    });

    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = "none";
        }
    });
});
