import { Carousel } from './carousel.js';

/**
 * @file app.js
 * @description Main application entry point for the Customizable Image Carousel.
 *              Initializes the carousel component once the DOM is ready.
 */

/**
 * Initializes the carousel component(s) on the page.
 * This function ensures the DOM is fully loaded before attempting to
 * find and manipulate elements, preventing potential errors.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded: Initializing Carousel Application.');

    // Select the main carousel container element.
    // This assumes there's an element with the ID 'myCarousel' in index.html.
    const carouselElement = document.getElementById('myCarousel');

    if (carouselElement) {
        /**
         * Configuration options for the carousel.
         * These can be customized based on the desired behavior.
         *
         * @typedef {object} CarouselOptions
         * @property {number} [initialSlide=0] - The index of the slide to start on.
         * @property {boolean} [autoplay=true] - Whether the carousel should automatically advance slides.
         * @property {number} [interval=5000] - The time in milliseconds between automatic slide transitions.
         * @property {boolean} [loop=true] - Whether the carousel should loop back to the first slide after the last.
         * @property {boolean} [showNavigation=true] - Whether to display previous/next navigation buttons.
         * @property {boolean} [showPagination=true] - Whether to display pagination dots.
         */
        const carouselOptions = {
            initialSlide: 0,
            autoplay: true,
            interval: 4000, // Slide every 4 seconds
            loop: true,
            showNavigation: true,
            showPagination: true,
        };

        // Create a new instance of the Carousel.
        // The Carousel class handles all the logic for navigation, pagination, and autoplay.
        const myCarousel = new Carousel(carouselElement, carouselOptions);

        console.log('Carousel initialized successfully:', myCarousel);

        // --- Example of potential future integration with other services ---
        // This section demonstrates how this carousel might interact with other
        // components or microservices in a larger system.

        // Example: If the Canvas Drawing Board project needed to display a gallery
        // of saved drawings, this carousel could be configured to load images
        // from a Canvas Drawing Board API endpoint.
        //
        // function loadImagesFromDrawingBoardService() {
        //     fetch('http://localhost:3001/api/drawings/gallery') // Assuming Drawing Board API
        //         .then(response => response.json())
        //         .then(images => {
        //             // myCarousel.updateSlides(images.map(img => ({ src: img.url, alt: img.title })));
        //             console.log('Fetched images from Drawing Board service:', images);
        //         })
        //         .catch(error => console.error('Error fetching drawing images:', error));
        // }
        //
        // // Uncomment to simulate loading images from another service
        // // loadImagesFromDrawingBoardService();

        // Example: If the Text-Based Adventure Game needed to display concept art
        // or character profiles, this carousel could be used.
        //
        // function loadConceptArtFromGameService() {
        //     fetch('http://localhost:3002/api/adventure/concept-art') // Assuming Adventure Game API
        //         .then(response => response.json())
        //         .then(artworks => {
        //             // myCarousel.updateSlides(artworks.map(art => ({ src: art.url, alt: art.description })));
        //             console.log('Fetched concept art from Adventure Game service:', artworks);
        //         })
        //         .catch(error => console.error('Error fetching concept art:', error));
        // }
        //
        // // Uncomment to simulate loading concept art from another service
        // // loadConceptArtFromGameService();

    } else {
        console.error('Carousel container element with ID "myCarousel" not found. Please ensure it exists in index.html.');
    }
});