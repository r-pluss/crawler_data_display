(function(){
    'use strict';

    angular
        .module('app')
        .controller('mainController', mainController);

    mainController.$inject= [];

    function mainController(){
        const self = this;
        self.fs = require('fs');
        self.ui = {
            events: {
                dincPage: deIncrementPageNumber,
                exitFullScreen: exitFullScreen,
                fsKeyUp: fullScreenKeyListener,
                fullScreen: fsElement,
                incPage: incrementPageNumber,
                nextFSImage: nextFSImage,
                pageChange: pageChangeEvent,
                prevFSImage: prevFSImage
            },
            fullScreenMode: false
        };
        self.thumbCollection = [
            {elem: 'thumb-0', position: 0, currentImgRawPath: null, currentIndex: null},
            {elem: 'thumb-1', position: 1, currentImgRawPath: null, currentIndex: null},
            {elem: 'thumb-2', position: 2, currentImgRawPath: null, currentIndex: null},
            {elem: 'thumb-3', position: 3, currentImgRawPath: null, currentIndex: null},
            {elem: 'thumb-4', position: 4, currentImgRawPath: null, currentIndex: null},
            {elem: 'thumb-5', position: 5, currentImgRawPath: null, currentIndex: null},
            {elem: 'thumb-6', position: 6, currentImgRawPath: null, currentIndex: null},
            {elem: 'thumb-7', position: 7, currentImgRawPath: null, currentIndex: null},
            {elem: 'thumb-8', position: 8, currentImgRawPath: null, currentIndex: null}
        ];
        self.testImages = [
            {path: './test_images/300_400.png'},
            {path: './test_images/350_150.png'},
            {path: './test_images/480_320.png'},
            {path: './test_images/500_500.png'},
            {path: './test_images/600_800.png'},
            {path: './test_images/600_1800.png'},
            {path: './test_images/720_480.png'},
            {path: './test_images/850_650.png'},
            {path: './test_images/1080_720.png'},
            {path: './test_images/1200_900.png'},
            {path: './test_images/1280_720.png'},
            {path: './test_images/1440_900.png'},
            {path: './test_images/1800_600.png'},
            {path: './test_images/1920_1080.png'},
            {path: './test_images/7680_4320.png'},
            {path: './test_images/amd1-001.gif'},
            {path: './test_images/amd1-028.gif'}
        ];
        self.currentPage = null;
        self.fsIndex = null;

        activate();

        function activate(){
            self.currentPage = 1;
            registerInitialEventHandlers();
            self.ui.events.pageChange();
        }

        function registerInitialEventHandlers(){
            window.document.getElementById('thumb-display').addEventListener('pageChange', pageChangeHandler);
            window.document.getElementById('prev-arrow').addEventListener('click', self.ui.events.dincPage);
            window.document.getElementById('next-arrow').addEventListener('click', self.ui.events.incPage);
            window.document.getElementById('fs-viewer').addEventListener('fullscreenchange', self.ui.events.exitFullScreen);
            window.document.getElementById('fs-viewer').addEventListener('click', self.ui.events.exitFullScreen, {capture: true});
            window.document.getElementById('fs-next-arrow').addEventListener('click', self.ui.events.nextFSImage, {capture: true});
            window.document.getElementById('fs-prev-arrow').addEventListener('click', self.ui.events.prevFSImage, {capture: true});
            window.document.getElementById('thumb-0').addEventListener('click', self.ui.events.fullScreen);
            window.document.getElementById('thumb-1').addEventListener('click', self.ui.events.fullScreen);
            window.document.getElementById('thumb-2').addEventListener('click', self.ui.events.fullScreen);
            window.document.getElementById('thumb-3').addEventListener('click', self.ui.events.fullScreen);
            window.document.getElementById('thumb-4').addEventListener('click', self.ui.events.fullScreen);
            window.document.getElementById('thumb-5').addEventListener('click', self.ui.events.fullScreen);
            window.document.getElementById('thumb-6').addEventListener('click', self.ui.events.fullScreen);
            window.document.getElementById('thumb-7').addEventListener('click', self.ui.events.fullScreen);
            window.document.getElementById('thumb-8').addEventListener('click', self.ui.events.fullScreen);
            window.addEventListener('keyup', self.ui.events.fsKeyUp);
        }

        function pageChangeEvent(){
            let e = new Event('pageChange', {cancelable: true, bubbles: true});
            window.document.getElementById('thumb-display').dispatchEvent(e);
        }

        function pageChangeHandler() {
            let imgPath;
            for(let thumb of self.thumbCollection){
                imgPath = imageURLFromSequence(thumb.position);
                thumb.currentImgRawPath = imgPath !== 'none' ? self.testImages[getImgCollectionIndex(thumb.position)].path : null;
                thumb.currentIndex = getImgCollectionIndex(thumb.position);
                window.document.getElementById(thumb.elem).style.backgroundImage = imgPath;
            }
        }

        function imageURLFromSequence(thumbPosition){
            try{
                return `url(${self.testImages[getImgCollectionIndex(thumbPosition)].path})`;
            }catch(e){
                return 'none';
            }
        }

        function getImgCollectionIndex(thumbPosition){
            let i = self.thumbCollection.length * (self.currentPage - 1) + thumbPosition;
            return i < self.testImages.length ? i : null;
        }

        function incrementPageNumber(){
            if(self.currentPage < Math.ceil(self.testImages.length / self.thumbCollection.length)){
                self.currentPage++;
                self.ui.events.pageChange();
            }
        }

        function deIncrementPageNumber(){
            if(self.currentPage > 1){
                self.currentPage--;
                self.ui.events.pageChange();
            }
        }

        function fsElement(e){
            for(let thumb of self.thumbCollection){
                if(thumb.elem === e.srcElement.id){
                    //clone the img to #fs-image and request fullscreen
                    if(thumb.currentImgRawPath){
                        self.fsIndex = thumb.currentIndex;
                        window.document.getElementById('fs-image').src = thumb.currentImgRawPath;
                        enterFullScreen();
                    }
                    break;
                }
            }
        }

        function enterFullScreen(){
            let el = window.document.getElementById('fs-viewer');
            el.style.position = 'static';
            el.webkitRequestFullScreen();
            self.ui.fullScreenMode = true;
        }

        function exitFullScreen(e){
            if(['fs-viewer', 'fs-image'].indexOf(e.srcElement.id) > -1 ){
                window.document.getElementById('fs-viewer').style.position = 'fixed';
                self.ui.fullScreenMode = false;
                self.fsIndex = null;
                if(window.document.webkitIsFullScreen){
                    window.document.webkitExitFullscreen();
                }
            }
        }

        function nextFSImage(e){
            e.preventDefault();
            e.stopPropagation();
            if(self.fsIndex + 1 < self.testImages.length){
                window.document.getElementById('fs-image').src = self.testImages[self.fsIndex + 1].path;
                self.fsIndex++;
            }
        }

        function prevFSImage(e){
            e.preventDefault();
            e.stopPropagation();
            if(self.fsIndex > 0){
                window.document.getElementById('fs-image').src = self.testImages[self.fsIndex - 1].path;
                self.fsIndex--;
            }
        }

        function fullScreenKeyListener(e){
            if(self.ui.fullScreenMode && ['ArrowLeft', 'ArrowRight'].indexOf(e.key) !== -1){
                if(e.key === 'ArrowLeft'){
                    prevFSImage(e);
                }else{
                    nextFSImage(e);
                }
            }
        }

    }
})();
