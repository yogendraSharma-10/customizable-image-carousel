/**
 * @file carousel.js
 * @description Core logic for the Customizable Image Carousel component.
 *              Provides functionality for navigation, pagination, and automatic sliding.
 */

/**
 * @class Carousel
 * @description A vanilla JavaScript class to create an interactive image carousel.
 *              Supports navigation buttons, pagination dots, and automatic sliding.
 */
class Carousel {
    /**
     * Default options for the carousel.
     * @static
     * @type {object}
     */
    static DEFAULT_OPTIONS = {
        autoPlay: true,
        interval: 5000, // milliseconds
        loop: true,
        navigation: true, // Show next/prev buttons
        pagination: true, // Show pagination dots
        transitionSpeed: '0.5s', // CSS transition duration
        initialSlide: 0, // 0-indexed
        pauseOnHover: true,
        keyboardNavigation: true,
        ariaLive: 'polite', // 'off', 'polite', 'assertive' for accessibility
    };

    /**
     * Creates an instance of Carousel.
     * @param {HTMLElement} containerElement - The main container element for the carousel.
     * @param {object} [options={}] - User-defined options to override defaults.
     */
    constructor(containerElement, options = {}) {
        if (!containerElement || !(containerElement instanceof HTMLElement)) {
            console.error('Carousel: Invalid container element provided.');
            throw new Error('Carousel: Container element must be a valid HTMLElement.');
        }

        this.container = containerElement;
        this.options = { ...Carousel.DEFAULT_OPTIONS, ...options };

        this.slidesContainer = this.container.querySelector('[data-carousel-slides]');
        this.slides = Array.from(this.slidesContainer ? this.slidesContainer.children : []);

        if (this.slides.length === 0) {
            console.warn('Carousel: No slides found within the carousel container.');
            return; // Exit if no slides to prevent further errors
        }

        this.currentIndex = Math.max(0, Math.min(this.options.initialSlide, this.slides.length - 1));
        this.autoPlayTimer = null;

        // DOM elements for navigation and pagination
        this.prevButton = this.container.querySelector('[data-carousel-prev]');
        this.nextButton = this.container.querySelector('[data-carousel-next]');
        this.paginationContainer = this.container.querySelector('[data-carousel-pagination]');

        this._init();
    }

    /**
     * Initializes the carousel by setting up its structure, styles, and initial state.
     * @private
     */
    _init() {
        this.container.classList.add('carousel-initialized');
        this.container.setAttribute('role', 'region');
        this.container.setAttribute('aria-label', 'Image Carousel');

        // Apply transition speed to the slides container
        if (this.slidesContainer) {
            this.slidesContainer.style.transitionDuration = this.options.transitionSpeed;
            this.slidesContainer.setAttribute('aria-live', this.options.ariaLive);
        }

        // Set up individual slides
        this.slides.forEach((slide, index) => {
            slide.classList.add('carousel-slide');
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-roledescription', 'slide');
            slide.setAttribute('aria-label', `${index + 1} of ${this.slides.length}`);
            slide.setAttribute('tabindex', '-1'); // Make slides not focusable by default
        });

        // Create pagination dots if enabled and not already present
        if (this.options.pagination && !this.paginationContainer) {
            this._createPaginationDots();
        } else if (this.paginationContainer) {
            // If pagination container exists, ensure it's visible if options.pagination is true
            this.paginationContainer.style.display = this.options.pagination ? '' : 'none';
        }

        // Hide/show navigation buttons based on options
        if (this.prevButton) {
            this.prevButton.style.display = this.options.navigation ? '' : 'none';
            this.prevButton.setAttribute('aria-label', 'Previous slide');
        }
        if (this.nextButton) {
            this.nextButton.style.display = this.options.navigation ? '' : 'none';
            this.nextButton.setAttribute('aria-label', 'Next slide');
        }

        this._bindEvents();
        this._updateUI(); // Set initial slide and active states

        if (this.options.autoPlay) {
            this._startAutoPlay();
        }
    }

    /**
     * Dynamically creates pagination dots and appends them to the container.
     * @private
     */
    _createPaginationDots() {
        this.paginationContainer = document.createElement('div');
        this.paginationContainer.classList.add('carousel-pagination');
        this.paginationContainer.setAttribute('role', 'tablist');
        this.paginationContainer.setAttribute('aria-label', 'Carousel pagination');
        this.container.appendChild(this.paginationContainer);

        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-pagination-dot');
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-controls', `carousel-slide-${index}`); // Assuming slides have IDs
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dot.dataset.slideIndex = index;
            this.paginationContainer.appendChild(dot);
        });
    }

    /**
     * Updates the UI to reflect the current slide.
     * This includes translating the slides container, updating active classes,
     * and managing button states.
     * @private
     */
    _updateUI() {
        if (!this.slidesContainer || this.slides.length === 0) return;

        const offset = -this.currentIndex * 100;
        this.slidesContainer.style.transform = `translateX(${offset}%)`;

        // Update active slide class
        this.slides.forEach((slide, index) => {
            if (index === this.currentIndex) {
                slide.classList.add('active');
                slide.setAttribute('aria-hidden', 'false');
                slide.setAttribute('tabindex', '0'); // Make active slide focusable
            } else {
                slide.classList.remove('active');
                slide.setAttribute('aria-hidden', 'true');
                slide.setAttribute('tabindex', '-1');
            }
        });

        // Update active pagination dot
        if (this.paginationContainer) {
            Array.from(this.paginationContainer.children).forEach((dot, index) => {
                if (index === this.currentIndex) {
                    dot.classList.add('active');
                    dot.setAttribute('aria-selected', 'true');
                } else {
                    dot.classList.remove('active');
                    dot.setAttribute('aria-selected', 'false');
                }
            });
        }

        // Disable/enable navigation buttons if not looping
        if (!this.options.loop) {
            if (this.prevButton) {
                this.prevButton.disabled = this.currentIndex === 0;
            }
            if (this.nextButton) {
                this.nextButton.disabled = this.currentIndex === this.slides.length - 1;
            }
        }
    }

    /**
     * Navigates to a specific slide index.
     * @param {number} index - The 0-based index of the slide to go to.
     */
    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) {
            if (this.options.loop) {
                this.currentIndex = (index < 0) ? this.slides.length - 1 : 0;
            } else {
                return; // Do nothing if out of bounds and not looping
            }
        } else {
            this.currentIndex = index;
        }

        this._updateUI();
        this._resetAutoPlay();
    }

    /**
     * Navigates to the next slide.
     */
    nextSlide() {
        this.goToSlide(this.currentIndex + 1);
    }

    /**
     * Navigates to the previous slide.
     */
    prevSlide() {
        this.goToSlide(this.currentIndex - 1);
    }

    /**
     * Starts the automatic sliding timer.
     * @private
     */
    _startAutoPlay() {
        if (this.options.autoPlay && !this.autoPlayTimer) {
            this.autoPlayTimer = setInterval(() => {
                this.nextSlide();
            }, this.options.interval);
        }
    }

    /**
     * Stops the automatic sliding timer.
     * @private
     */
    _stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    /**
     * Resets the auto-play timer (stops and then starts it again).
     * Useful after manual navigation.
     * @private
     */
    _resetAutoPlay() {
        this._stopAutoPlay();
        this._startAutoPlay();
    }

    /**
     * Handles click events on navigation buttons (prev/next).
     * @param {Event} event - The click event.
     * @private
     */
    _handleNavigationClick(event) {
        if (event.currentTarget === this.prevButton) {
            this.prevSlide();
        } else if (event.currentTarget === this.nextButton) {
            this.nextSlide();
        }
    }

    /**
     * Handles click events on pagination dots.
     * @param {Event} event - The click event.
     * @private
     */
    _handlePaginationClick(event) {
        const dot = event.currentTarget;
        const index = parseInt(dot.dataset.slideIndex, 10);
        if (!isNaN(index)) {
            this.goToSlide(index);
        }
    }

    /**
     * Handles mouse enter event on the carousel container.
     * Pauses auto-play if `pauseOnHover` is true.
     * @private
     */
    _handleMouseEnter = () => {
        if (this.options.pauseOnHover) {
            this._stopAutoPlay();
        }
    };

    /**
     * Handles mouse leave event on the carousel container.
     * Resumes auto-play if `pauseOnHover` is true.
     * @private
     */
    _handleMouseLeave = () => {
        if (this.options.pauseOnHover) {
            this._startAutoPlay();
        }
    };

    /**
     * Handles keyboard events for navigation.
     * @param {KeyboardEvent} event - The keyboard event.
     * @private
     */
    _handleKeyDown = (event) => {
        if (!this.options.keyboardNavigation) return;

        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.prevSlide();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextSlide();
                break;
            case 'Home':
                event.preventDefault();
                this.goToSlide(0);
                break;
            case 'End':
                event.preventDefault();
                this.goToSlide(this.slides.length - 1);
                break;
        }
    };

    /**
     * Binds all necessary event listeners to the carousel elements.
     * @private
     */
    _bindEvents() {
        if (this.prevButton && this.options.navigation) {
            this.prevButton.addEventListener('click', this._handleNavigationClick);
        }
        if (this.nextButton && this.options.navigation) {
            this.nextButton.addEventListener('click', this._handleNavigationClick);
        }

        if (this.paginationContainer && this.options.pagination) {
            this.paginationContainer.addEventListener('click', (event) => {
                if (event.target.classList.contains('carousel-pagination-dot')) {
                    this._handlePaginationClick(event);
                }
            });
        }

        if (this.options.autoPlay && this.options.pauseOnHover) {
            this.container.addEventListener('mouseenter', this._handleMouseEnter);
            this.container.addEventListener('mouseleave', this._handleMouseLeave);
        }

        if (this.options.keyboardNavigation) {
            this.container.addEventListener('keydown', this._handleKeyDown);
        }
    }

    /**
     * Unbinds all event listeners. Useful for destroying the carousel instance.
     * @private
     */
    _unbindEvents() {
        if (this.prevButton) {
            this.prevButton.removeEventListener('click', this._handleNavigationClick);
        }
        if (this.nextButton) {
            this.nextButton.removeEventListener('click', this._handleNavigationClick);
        }

        if (this.paginationContainer) {
            this.paginationContainer.removeEventListener('click', (event) => {
                if (event.target.classList.contains('carousel-pagination-dot')) {
                    this._handlePaginationClick(event);
                }
            });
        }

        this.container.removeEventListener('mouseenter', this._handleMouseEnter);
        this.container.removeEventListener('mouseleave', this._handleMouseLeave);
        this.container.removeEventListener('keydown', this._handleKeyDown);

        this._stopAutoPlay();
    }

    /**
     * Destroys the carousel instance, removing all event listeners and restoring
     * the DOM to its original state as much as possible.
     */
    destroy() {
        this._unbindEvents();

        this.container.classList.remove('carousel-initialized');
        this.container.removeAttribute('role');
        this.container.removeAttribute('aria-label');

        if (this.slidesContainer) {
            this.slidesContainer.style.transform = '';
            this.slidesContainer.style.transitionDuration = '';
            this.slidesContainer.removeAttribute('aria-live');
        }

        this.slides.forEach(slide => {
            slide.classList.remove('carousel-slide', 'active');
            slide.removeAttribute('role');
            slide.removeAttribute('aria-roledescription');
            slide.removeAttribute('aria-label');
            slide.removeAttribute('aria-hidden');
            slide.removeAttribute('tabindex');
        });

        if (this.prev