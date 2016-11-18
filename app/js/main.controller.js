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

        self.currentPage = null;
        self.fsIndex = null;
        self.totalPages = null;

        activate();

        function activate(){
            readJSONConfig();
            self.totalPages = Math.ceil(self.content.length / self.thumbCollection.length);
            if(self.currentPage === null){
                self.currentPage = 1;
            }
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

        function fullScreenKeyListener(e){
            if(self.ui.fullScreenMode && ['ArrowLeft', 'ArrowRight'].indexOf(e.key) !== -1){
                if(e.key === 'ArrowLeft'){
                    prevFSImage(e);
                }else{
                    nextFSImage(e);
                }
            }
        }

        function pageChangeHandler() {
            let imgPath;
            for(let thumb of self.thumbCollection){
                imgPath = imageURLFromSequence(thumb.position);
                thumb.currentImgRawPath = imgPath !== 'none' ? self.content[getImgCollectionIndex(thumb.position)].path : null;
                thumb.currentIndex = getImgCollectionIndex(thumb.position);
                window.document.getElementById(thumb.elem).style.backgroundImage = imgPath;
            }
        }

        function imageURLFromSequence(thumbPosition){
            try{
                return `url(${self.content[getImgCollectionIndex(thumbPosition)].path})`;
            }catch(e){
                return 'none';
            }
        }

        function getImgCollectionIndex(thumbPosition){
            let i = self.thumbCollection.length * (self.currentPage - 1) + thumbPosition;
            return i < self.content.length ? i : null;
        }

        function incrementPageNumber(){
            if(self.currentPage < self.totalPages){
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
            if((self.fsIndex + 1) < (self.content.length - 1)){
                window.document.getElementById('fs-image').src = self.content[self.fsIndex + 1].path;
                self.fsIndex++;
            }
        }

        function prevFSImage(e){
            e.preventDefault();
            e.stopPropagation();
            if(self.fsIndex > 0){
                window.document.getElementById('fs-image').src = self.content[self.fsIndex - 1].path;
                self.fsIndex--;
            }
        }

        function readJSONConfig(){
            let data = self.fs.readFileSync('./app/config.json', {encoding: 'utf-8', flag: 'r'});
            let config = window.JSON.parse(data);
            self.content = config.imageData;
            if(config.titleBadge){
                setTitleBadge(config.titleBadge);
            }
            if(self.fs.existsSync('./persist.json')){
                let savedState = self.fs.readFileSync('./app/persist.json');
                if(savedState.currentPage){
                    self.currentPage = savedState.currentPage;
                }
            }
        }

        function setTitleBadge(path){
            window.document.getElementById('title-badge').style.backgroundImage = `url(${path})`;
        }

    }
})();
