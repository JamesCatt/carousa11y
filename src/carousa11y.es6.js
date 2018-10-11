/**
 * Carousa11y
 * Author: James Catt
 * License: ?
 */

import './carousa11y.scss';

export default class Carousa11y {
    
    /**
     * @constructor
     * @param {HTMLElement} carouselRoot - Root/wrapper HTML element for the carousel
     * @param {Array.<HTMLElement>} carouselSlides - The slides for inclusion in the carousel
     * @param {Object} options - Options container
     * @param {Number} options.autoAdvanceTime - Number of milliseconds to wait between auto-advancing to next slide. Set 0 to disable auto-advance.
     * @param {Number} options.transitionTime - Number of milliseconds to allow for CSS transitions between slides.
     * @param {(boolean|Object)} options.autoCreateControls - Setting false suppresses creation of any controls. Object allows suppression of specific control elements
     * @param {boolean} options.autoCreateControls.announceElement - Set false to suppress creation of an aria-live region for announcing the current slide.
     * @param {boolean} options.autoCreateControls.prevNextButtons - Set false to suppress creation of 'previous slide' and 'next slide' controls.
     * @param {boolean} options.autoCreateControls.playStopButton - Set false to suppress creation of a play/stop toggle button.
     * @param {boolean} options.autoCreateControls.slideButtons - Set false to suppress creation of a list of buttons for selecting a specific slide.
     */
    constructor(

        carouselRoot,
        carouselSlides,
        { // default options
            autoAdvanceTime = 5000,
            transitionTime = 300,
            autoCreateControls = {},
        } = {}

    ) {

        // validate carouselRoot
        if (carouselRoot instanceof HTMLElement !== true) {
            throw new Error('carouselRoot must be an HTMLElement.');
        }

        // validate carouselSlides
        if (carouselSlides instanceof Array !== true || carouselSlides.length < 2) {
            throw new Error('carouselSlides must be an array with at least 2 HTMLElements.');
        }

        carouselSlides.forEach(slide => {

            if (slide instanceof HTMLElement !== true) {
                throw new Error(`carouselSlides array must contain only HTMLElements. carouselSlides[${index}] failed this test.`);
            }

        });

        // validation tests passed, proceed with instantiation
        this.carouselRoot = carouselRoot;
        this.carouselSlides = carouselSlides;
        this.autoCreateControls = autoCreateControls;
        this.autoAdvanceTime = autoAdvanceTime; // note that validity checking of autoAdvanceTime value will be handled by the autoAdvanceTime setter method
        this.transitionTime = transitionTime; // note that validity checking of transitionTime value will be handled by the transitionTime setter method

        // Private properties
        this._playing = this.autoAdvanceTime !== 0;
        this._currentSlideIndex = 0;

        // Set appropriate starting CSS classes on slides
        this.carouselSlides[this.currentSlideIndex].classList.add('s-carousa11y__slide--current');
        this.carouselSlides[this.nextSlideIndex].classList.add('s-carousa11y__slide--next');
        this.carouselSlides[this.previousSlideIndex].classList.add('s-carousa11y__slide--previous');

        // insert default controls as appropriate
        if (this.autoCreateControls.announceElement !== false) {
            this.carouselRoot.appendChild(this._createAnnounceElement());
        }

        if (this.autoCreateControls.prevNextButtons !== false) {
            this.carouselRoot.appendChild(this._createPrevNextControls());
            document.getElementById('carousa11yNextButton').addEventListener('click', () => {this.goToNextSlide();});
            document.getElementById('carousa11yPrevButton').addEventListener('click', () => {this.goToPreviousSlide();});
        }

        if (this.autoCreateControls.playStopButton !== false) {
            this.carouselRoot.appendChild(this._createPlayStopButton(this.autoAdvanceTime > 0));
        }

        if (this.autoCreateControls.slideButtons !== false) {
            this.carouselRoot.appendChild(this._createGoToSlideControls(this.carouselSlides.length));
            const slideButtons = Array.from(document.getElementsByClassName('c-carousa11y__button--go-to-slide'));
            slideButtons.forEach(slideButton => {
                slideButton.addEventListener('click', e => {
                    this.goToSlide(e.currentTarget.dataset.slideButton, null, true);
                });
            });
        }

    }

    /**
     * Go to the next slide
     */
    goToNextSlide() {
        this._goToSlide(this.nextSlideIndex, true, false);
    }

    /**
     * Go to the previous slide
     */
    goToPreviousSlide() {
        this._goToSlide(this.previousSlideIndex, false, false);
    }

    /**
     * Go to a specific slide
     * @param {Number} slideNumber - Number of the slide to go to, not zero-indexed (i.e., first slide === 1).
     */
    goToSlide(slideNumber, directionIsForwards, setFocus) {
        this._goToSlide(slideNumber - 1, directionIsForwards, setFocus);
    }

    /**
     * Start auto-advancing the carousel
     */
    play() {

    }

    /**
     * Stop auto-advancing the carousel
     */
    stop() {

    }

    /**
     * Get the non-zero-indexed number of the currently-displayed slide
     * @return {number} - non zero-indexed number of the currently-displayed slide
     */
    get currentSlide() {
        return this._currentSlideIndex + 1;
    }

    /**
     * Prevents setting of the current slide directly
     */
    set currentSlide(slideNumber) {
        throw new Error('currentSlide cannot be set directly. Use goToSlide(slideNumber) instead.');
    }

    /**
     * Get the zero-indexed number for the current slide
     * @return {number}
     */
    get currentSlideIndex() {
        return this._currentSlideIndex;
    }

    /**
     * Get the zero-indexed number of the next slide from the current one
     * @return {number}
     */
    get nextSlideIndex() {
        
        if (this.currentSlideIndex < this.carouselSlides.length - 1) {
            return this.currentSlideIndex + 1;
        } else {
            return 0;
        }

    }

    /**
     * Get the zero-indexed number of the previous slide from the current one
     * @return {number}
     */
    get previousSlideIndex() {
        
        if (this.currentSlideIndex === 0) {
            return this.carouselSlides.length - 1;
        } else {
            return this.currentSlideIndex - 1;
        }

    }

    /**
     * Set the auto-advance timer
     * @param {number} duration - number of milliseconds before auto-advancing to the next slide
     */
    set autoAdvanceTime(duration) {
        if (typeof duration !== 'number') {
            throw new Error('autoAdvanceTime must be set to an number (milliseconds).');
        }
        this._autoAdvanceTime = duration;
    }

    /**
     * Get the current auto-advance timer
     * @returns {number}
     */
    get autoAdvanceTime() {
        return this._autoAdvanceTime;
    }

    /**
     * @param {number} duration - number of milliseconds to allow for CSS transitions between slides
     */
    set transitionTime(duration) {
        if (typeof duration !== 'number') {
            throw new Error('transitionTime must be set to an number (milliseconds).');
        }
        this._transitionTime = duration;        
    }

    /**
     * Get the current slide transition time
     * @returns {number}
     */
    get transitionTime() {
        return this._transitionTime;
    }

    // Private methods
    /**
     * 
     */
    _autoAdvance() {

    }

    /**
     * 
     * @param {number} slideIndex - The zero-indexed number for the slide to advance to
     * @param {boolean} directionIsForwards - true if the carousel should behave as advancing in a forwards (i.e., rightward) direction, default is based on comparing the indices of the new slide and existing current slide
     */
    _goToSlide(slideIndex, directionIsForwards = slideIndex > this.currentSlideIndex, setFocus = false) {

        if (slideIndex >= this.carouselSlides.length || slideIndex < 0) {
            throw new Error(`invalid slide index: ${slideIndex}`);
        }

        if (slideIndex === this.currentSlideIndex) {
            return;
        }

        // set these before updating _currentSlideIndex
        const oldPreviousSlide = this.carouselSlides[this.previousSlideIndex];
        const oldNextSlide = this.carouselSlides[this.nextSlideIndex];
        const outgoingSlide = this.carouselSlides[this._currentSlideIndex]

        this._currentSlideIndex = slideIndex;

        const incomingSlide = this.carouselSlides[slideIndex];

        if (directionIsForwards) {

            const newNextSlide = this.carouselSlides[this.nextSlideIndex];
            outgoingSlide.classList.add('s-carousa11y__slide--previous');
            incomingSlide.classList.add('s-carousa11y__slide--current');
            outgoingSlide.classList.remove('s-carousa11y__slide--current');
            
            setTimeout(() => {
                outgoingSlide.setAttribute('aria-hidden', 'true');
                incomingSlide.removeAttribute('aria-hidden');
                incomingSlide.classList.remove('s-carousa11y__slide--next');
                incomingSlide.classList.remove('s-carousa11y__slide--previous');
                oldPreviousSlide.classList.remove('s-carousa11y__slide--previous');
                newNextSlide.classList.add('s-carousa11y__slide--next');
            }, this.transitionTime);

        } else {

            const newPreviousSlide = this.carouselSlides[this.previousSlideIndex];
            outgoingSlide.classList.add('s-carousa11y__slide--next');
            incomingSlide.classList.add('s-carousa11y__slide--current');
            outgoingSlide.classList.remove('s-carousa11y__slide--current');
            
            setTimeout(() => {
                outgoingSlide.setAttribute('aria-hidden', 'true');
                incomingSlide.removeAttribute('aria-hidden');
                incomingSlide.classList.remove('s-carousa11y__slide--next');
                incomingSlide.classList.remove('s-carousa11y__slide--previous');
                oldNextSlide.classList.remove('s-carousa11y__slide--next');
                newPreviousSlide.classList.add('s-carousa11y__slide--previous');
            }, this.transitionTime);

        }

        if (setFocus) {
            incomingSlide.setAttribute('tabindex', '-1');
            incomingSlide.focus();
        }

    }

    // Control creation methods

    /**
     * @return {HTMLDivElement} - Returns a <div> with the appropriate attributes for the aria-live slide announcement element, for insertion into the DOM.
     */
    _createAnnounceElement() {
    let announceElement = document.createElement('div');
        announceElement.id = 'carousa11yAnnounceElement';
        announceElement.setAttribute('aria-live', 'polite');
        announceElement.setAttribute('aria-atomic', 'true');
        announceElement.classList.add('c-carousa11y__announce', 'u-display--screenreader-only');

        return announceElement;
    }

    /**
     * @return {HTMLUListElement} - Returns a <ul> with nested previous/next slide buttons, for insertion into the DOM.
     */
    _createPrevNextControls() {

        let controlsElement = document.createElement('ul');
        controlsElement.classList.add('c-carousa11y__controls', 'c-carousa11y__controls--prev-next');

        controlsElement.innerHTML = 

            "<li class='c-carousa11y__controls-item c-carousa11y__controls-item--prev'>" +

                "<button id='carousa11yPrevButton' class='c-carousa11y__button c-carousa11y__button--prev'>" +

                    "<span class='u-display--screenreader-only'>Go to previous slide</span>" +

                    "<!-- Zondicons by Steve Schroger - http://www.zondicons.com/ -->" +
                    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' class='c-carousa11y__button-icon' aria-hidden='true' role='presentation'><path d='M7.05 9.293L6.343 10 12 15.657l1.414-1.414L9.172 10l4.242-4.243L12 4.343z'/></svg>" +

                "</button>" +

            "</li>" +

            "<li class='c-carousa11y__controls-item c-carousa11y__controls-item--next'>" +

                "<button id='carousa11yNextButton' class='c-carousa11y__button c-carousa11y__button--next'>" +

                    "<span class='u-display--screenreader-only'>Go to next slide</span>" +

                    "<!-- Zondicons by Steve Schroger - http://www.zondicons.com/ -->" +
                    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' class='c-carousa11y__button-icon' aria-hidden='true' role='presentation'><path d='M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z'/></svg>" +

                "</button>" +

            "</li>";

        return controlsElement;
    }

    /**
     * @param {boolean} currentlyPlaying - If true, the returned button will be toggled to play mode on.
     * @return {HTMLButtonElement} - Returns a <button> to serve as a play/stop toggle for insertion into the DOM.
     */
    _createPlayStopButton(currentlyPlaying) {

        let playStopButton = document.createElement('button');
        playStopButton.setAttribute('id', 'carousa11yPlayStopButton');
        playStopButton.setAttribute('aria-label', currentlyPlaying === true ? 'Stop' : 'Play');
        playStopButton.dataset.state = currentlyPlaying === true ? 'playing' : 'stopped';
        playStopButton.className = 'c-carousa11y__button c-carousa11y__button--play-stop';
        playStopButton.innerHTML = 

            '<!-- Zondicons by Steve Shroger - http://www.zondicons.com/ -->' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="c-carousa11y__button-icon c-carousa11y__button-icon--play" aria-hidden="true" role="presentation"><path d="M4 4l12 6-12 6z"/></svg>' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="c-carousa11y__button-icon c-carousa11y__button-icon--pause" aria-hidden="true" role="presentation"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM7 6v8h2V6H7zm4 0v8h2V6h-2z"/></svg>';

        return playStopButton;

    }

    /**
     * @param {number} slideCount - Number of slides in the carousel.
     * @return {HTMLOListElement} - Returns an <ol> with nested buttons to advance to a particular slide for insertion into the DOM.
     */
    _createGoToSlideControls(slideCount) {

        let goToControlsElement = document.createElement('ol');
        goToControlsElement.classList.add('c-carousa11y__controls', 'c-carousa11y__controls--goto');

        for (let i = 0; i < slideCount; i++) {

            let goToSlideItem = document.createElement('li');
            goToSlideItem.classList.add('c-carousa11y__controls-item', 'c-carousa11y__controls-item--go-to-slide');

            let goToSlideButton = document.createElement('button');
            goToSlideButton.classList.add('c-carousa11y__button', 'c-carousa11y__button--go-to-slide');
            goToSlideButton.dataset.slideButton = i + 1;
            goToSlideButton.innerHTML = `<span class="u-display--screenreader-only">Go to slide ${i + 1}</span>`;

            if (i === this._currentSlide) {
                goToSlideButton.setAttribute('aria-current', 'true');
            }

            goToSlideItem.appendChild(goToSlideButton);
            goToControlsElement.appendChild(goToSlideItem);

        }

        return goToControlsElement;

    }

}