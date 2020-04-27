/**  
* @fileOverview File Open / Save plugin
* @license Copyright (c) 2017-2020 by Henry Kroll III of thenerdshow.com All rights reserved.
* For a copy of the Apache 2.0 license, see LICENSE.txt
*/

'use strict';

CKEDITOR.plugins.add('open_save', {
    icons: 'open_icon,save_icon',
    lang: 'af,ar,az,bg,bn,bs,ca,cs,cy,da,de,de-ch,el,en,en-au,en-ca,en-gb,eo,es,es-mx,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,oc,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,tt,ug,uk,vi,zh,zh-cn',
    init: function(editor){
        var pluginName = 'open_save',
        lang = editor.lang.open_save;
        window.fil = new CKEDITOR.dom.element('input');
        fil.$.id = 'file';
        fil.$.type = 'file';
        fil.$.style.display = 'none';
        
        editor.addCommand('openFile', {
            exec : function(editor){
                fil.$.click();
            }
        });
        editor.addCommand('saveFile', {
            exec : function(editor){
                fileSave(editor);
            }
        });
        
        editor.ui.addButton('FileOpen', {
            label: lang.open,
            command: 'openFile',
            icon: 'open_icon', // http://www.fedoraproject.org/
            toolbar: 'document,1'
        });
        editor.ui.addButton('FileSave', {
            label: lang.save,
            command: 'saveFile',
            icon: 'save_icon', // http://www.myiconfinder.com/
            toolbar: 'document,1'
        });
        editor.setKeystroke([
                [ CKEDITOR.CTRL + 83 /*S*/, 'saveFile' ],
                [ CKEDITOR.CTRL + 79 /*O*/, 'openFile' ],
        ]);
        
        var thisDoc = "document";
        function fileSave(editor){
            var text = editor.getData(null);
            var textFile = new Blob([text], {
                type: 'text/html'
            });
            var title = prompt(lang.msg + " \"" + thisDoc + "\"", thisDoc) || null;
            return title? invokeSaveAsDialog(textFile, title + ".html"): false;
        }
        /** from Muaz Khan. (2017). WebRTC and the Web!
         * https://muaz-khan.blogspot.com/2012/10/save-files-on-disk-using-javascript-or.html
         *
         * @param {Blob} file - File or Blob object. This parameter is required.
         * @param {string} fileName - Optional file name e.g. "image.png"
         */
        function invokeSaveAsDialog(file, fileName){
            if (!file){
                throw 'Blob object is required.';
            }

            if (!file.type){
                file.type = 'video/webm';
            }

            var fileExtension = file.type.split('/')[1];

            if (fileName && fileName.indexOf('.') !== -1){
                var splitted = fileName.split('.');
                fileName = splitted[0];
                fileExtension = splitted[1];
            }

            var fileFullName = (fileName || (Math.round(Math.random() * 9999999999) + 888888888)) + '.' + fileExtension;

            if (typeof navigator.msSaveOrOpenBlob !== 'undefined'){
                return navigator.msSaveOrOpenBlob(file, fileFullName);
            } else if (typeof navigator.msSaveBlob !== 'undefined'){
                return navigator.msSaveBlob(file, fileFullName);
            }

            var hyperlink = document.createElement('a');
            hyperlink.href = URL.createObjectURL(file);
            hyperlink.target = '_blank';
            hyperlink.download = fileFullName;

            if (!!navigator.mozGetUserMedia){
                hyperlink.onclick = function(){
                    (document.body || document.documentElement).removeChild(hyperlink);
                };
                (document.body || document.documentElement).appendChild(hyperlink);
            }

            var evt = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });

            hyperlink.dispatchEvent(evt);

            if (!navigator.mozGetUserMedia){
                URL.revokeObjectURL(hyperlink.href);
            }
        }  
        editor.on('instanceReady', function(e){
            editor.setKeystroke(
                [ CKEDITOR.CTRL + 79 /*O*/, 'openFile' ],
                [ CKEDITOR.CTRL + 83 /*S*/, 'saveFile' ],
            );

            // from Bidelman, E. (2010). Reading files in JavaScript using the File APIs. [tutorial] Retrieved from https://www.html5rocks.com/en/tutorials/file/dndfiles/
            function handleFileSelect(evt){
            var f = evt.target.files[0]; // FileList object
                window.reader = new FileReader();
                // Closure to capture the file information.
                reader.onload = (function(theFile){
                return function(e){
                    editor.setData(e.target.result);
                    evt.target.value = null; // allow reload
                };
                })(f);
                // Read file as text
                reader.readAsText(f);
                thisDoc = f.name;
            }
            window.edx = editor.document.getBody().$;
            document.body.appendChild(fil.$);
            fil.$.addEventListener('change', handleFileSelect, false);
        }); // instanceReady
    } //init
});