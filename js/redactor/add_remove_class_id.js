if (!RedactorPlugins) var RedactorPlugins = {};

RedactorPlugins.add_remove_class_id = function()
{
    return {
        classIDTemplate: function()
        {
            return String() + '<section id="redactor-add_remove_class_id"></section>';
        },

        init: function()
        {
            var dropdown = {};

            // tag
            dropdown.addRemoveClassIDTag = { title: 'Tag', func: this.add_remove_class_id.showTagModal };

            // span
            dropdown.addRemoveClassIDSpan = { title: 'Span', func: this.add_remove_class_id.showSpanModal };

            // block
            dropdown.addRemoveClassIDBlock = { title: 'Block', func: this.add_remove_class_id.showBlockModal };

            // link
            dropdown.addRemoveClassIDLink = { title: 'Link', func: this.add_remove_class_id.showLinkModal };

            // image
            dropdown.addRemoveClassIDImage = { title: 'Image', func: this.add_remove_class_id.showImageModal };

            // table
            dropdown.addRemoveClassIDTable = { title: 'Table', func: this.add_remove_class_id.showTableModal };

            var add_remove_class_id = this.button.add('add_remove_class_id', 'Class and ID');
            this.button.setAwesome('add_remove_class_id', 'fa-plus');
            this.button.addDropdown(add_remove_class_id, dropdown);

            // image selection
            // select all images in Redactor, and on click, toggle .redactor-selected-image class
            $('.redactor-box').on('click', 'img', function() {
                $(this).toggleClass('redactor-selected-image');
            });
        },

        makeClassTabContent: function(classes)
        {
            // class
            var classArray;
            var classMessage;
            var classAssignedlist = '';
            var classOptionList = '';
            var removeClass;

            if (classes) {
                // split the classes string
                // - split the string using the space separator
                // - the substrings become array elements of classArray
                classArray = classes.split(' ');

                // show only if there are classes
                classMessage = '<p class="message">' + 'Assigned Class:' + '</p>';

                // if there is more than one class, make "Class" plural
                if (classArray.length > 1) {
                    classMessage = '<p class="message">' + 'Assigned Classes:' + '</p>';
                }

                // loop through the classArray
                // - create the assigned class <p> items
                // - create the "Remove Class" select options
                for (var i = 0; i < classArray.length; i++) {
                   classAssignedlist += '<p>' + classArray[i] + '</p>';
                   classOptionList += '<option value="' + classArray[i] + '">' + classArray[i] + '</option>';
                }

                // show "Remove Class" only if there are classes
                removeClass = '<br><br><label>' + 'Remove Class' + '</label><br>'
                            + '<select id="redactor-remove-class" class="js-example-basic-multiple" multiple="multiple">'
                            + classOptionList
                            + '</select>';
            } else {
                classArray = '';
                classMessage = '';
                removeClass = '';
            }

            return String()
            + '<div class="redactor-modal-class_id">'
                + classMessage
                + classAssignedlist
                + '<label>' + 'Add Class' + '</label>'
                + '<br>'
                + '<input type="text" id="redactor-add-class" />'
                + removeClass
            + '</div>';
        },

        makeIDTabContent: function(id)
        {
            // ID
            var idMessage = '';
            var currentID = '';
            var currentIDSelect = '';

            if (id) {
                // show only if there is an ID
                idMessage = '<p class="message">' + 'Assigned ID:' + '</p>';
                currentID = '<p>' + id + '</p>';

                // show "Remove ID" only if there is an ID
                currentIDSelect = '<br><br><label>' + 'Remove ID' + '</label><br>'
                                + '<select id="redactor-remove-id" class="id-select"><option></option><option value="' + id + '">' + id + '</option></select>';
            }

            return String()
            + '<div class="redactor-modal-class_id">'
                + idMessage
                + currentID
                + '<label>' + 'Add ID' + '</label>'
                + '<br>'
                + '<input type="text" id="redactor-add-id" />'
                + currentIDSelect
            + '</div>';
        },

        // tag
        showTagModal: function()
        {
            // based on the current selection, get the closest parent element
            var parentElement = this.selection.getParent();

            // get the class of the parent element
            var classes = $(parentElement).attr('class');

            // get the ID of the parent element
            var id = $(parentElement).attr('id');

            this.modal.addTemplate('tag_modal', this.add_remove_class_id.classIDTemplate());

            this.modal.load('tag_modal', 'Tag', 400);
            this.modal.createCancelButton();

            var button = this.modal.createActionButton('update');
            button.on('click', this.add_remove_class_id.changeTag);

            this.selection.save();
            this.modal.show();

            // create modal tabs
            var $modal = this.modal.getModal();

            this.modal.createTabber($modal);
            this.modal.addTab(1, 'Class', 'active');
            this.modal.addTab(2, 'ID');

            var idTabContent = this.add_remove_class_id.makeIDTabContent(id);
            var classTabContent = this.add_remove_class_id.makeClassTabContent(classes);

            var $tabBox1 = $('<div class="redactor-tab redactor-tab1">' + classTabContent + '</div>');
            var $tabBox2 = $('<div class="redactor-tab redactor-tab2">' + idTabContent + '</div>').hide();

            $modal.append($tabBox1);
            $modal.append($tabBox2);
            // end create modal tabs

            // call select2() after showing the modal
            $(".js-example-basic-multiple").select2();
        },
        changeTag: function()
        {
            var addClass = $('#redactor-add-class').val();

            var removeClassArray = $('#redactor-remove-class').val();
            var removeClass = '';
            // if there are elements in removeClassArray
            // - join the array elements using a single space as a separator
            if (removeClassArray) {
                removeClass = removeClassArray.join(' ');
            }

            var addID = $('#redactor-add-id').val();
            var removeID = $('#redactor-remove-id').val();

            this.modal.close();
            this.selection.restore();

            this.buffer.set();

            var currentSelection = this.selection.getCurrent();

            // - add the class
            $(currentSelection).addClass(addClass);
            // - remove the class
            $(currentSelection).removeClass(removeClass);

            // - add/remove the ID
            // - remove the ID attribute if empty
            // - remove the class attribute if empty
            if ((addID && removeID) || (addID && !removeID)) {
                $(currentSelection).attr('id', addID);
            } else if (!addID && removeID) {
                $(currentSelection).removeAttr('id');
            }

            this.utils.removeEmptyAttr(currentSelection, 'class');
            this.code.sync();
        },

        // span
        showSpanModal: function()
        {
            var currentSelection = this.selection.getCurrent();

            // based on the current selection, find the closest span, then get its class
            var classes = $(currentSelection).closest('span').attr('class');

            // based on the current selection, find the closest span, then get its id
            var id = $(currentSelection).closest('span').attr('id');

            this.modal.addTemplate('span_modal', this.add_remove_class_id.classIDTemplate());

            this.modal.load('span_modal', 'Span', 400);
            this.modal.createCancelButton();

            var button = this.modal.createActionButton('update');
            button.on('click', this.add_remove_class_id.changeSpan);

            this.selection.save();
            this.modal.show();

            // create modal tabs
            var $modal = this.modal.getModal();

            this.modal.createTabber($modal);
            this.modal.addTab(1, 'Class', 'active');
            this.modal.addTab(2, 'ID');

            var idTabContent = this.add_remove_class_id.makeIDTabContent(id);
            var classTabContent = this.add_remove_class_id.makeClassTabContent(classes);

            var $tabBox1 = $('<div class="redactor-tab redactor-tab1">' + classTabContent + '</div>');
            var $tabBox2 = $('<div class="redactor-tab redactor-tab2">' + idTabContent + '</div>').hide();

            $modal.append($tabBox1);
            $modal.append($tabBox2);
            // end create modal tabs

            // call select2() after showing the modal
            $(".js-example-basic-multiple").select2();
        },
        changeSpan: function()
        {
            var addClass = $('#redactor-add-class').val();

            var removeClassArray = $('#redactor-remove-class').val();
            var removeClass = '';
            // if there are elements in removeClassArray
            // - join the array elements using a single space as a separator
            if (removeClassArray) {
                removeClass = removeClassArray.join(' ');
            }

            var addID = $('#redactor-add-id').val();
            var removeID = $('#redactor-remove-id').val();

            this.modal.close();
            this.selection.restore();

            this.buffer.set();

            var currentSelection = this.selection.getCurrent();

            // based on the current selection, find the closest span
            // this will get
            // - a span if the cursor is inside the span
            // - a partial internal selection of the span
            // - a full selection of the span
            var $closestSpan = $(currentSelection).closest('span');

            // if there is no span in the selection, $closestSpan.length will be 0
            // if there is a span in the selection, $closestSpan.length will be 1

            // if there is a span in the selection
            // - add the class
            // - remove the class
            // - add/remove the ID
            // - remove the ID attribute if empty
            // - remove the class attribute if empty
            if ($closestSpan.length) {
                $closestSpan.addClass(addClass);
                $closestSpan.removeClass(removeClass);

                if ((addID && removeID) || (addID && !removeID)) {
                    $closestSpan.attr('id', addID);
                } else if (!addID && removeID) {
                    $closestSpan.removeAttr('id');
                }

                this.utils.removeEmptyAttr($closestSpan, 'class');
            }

            this.code.sync();
        },

        // block
        showBlockModal: function()
        {
            // based on the selection, get the closest block element
            var block = this.selection.getBlock();

            // get the block classes
            var classes = block.className;

            // get the block ID
            var id = block.getAttribute('id');

            this.modal.addTemplate('block_modal', this.add_remove_class_id.classIDTemplate());

            this.modal.load('block_modal', 'Block', 400);
            this.modal.createCancelButton();

            var button = this.modal.createActionButton('update');
            button.on('click', this.add_remove_class_id.changeBlock);

            this.selection.save();
            this.modal.show();

            // create modal tabs
            var $modal = this.modal.getModal();

            this.modal.createTabber($modal);
            this.modal.addTab(1, 'Class', 'active');
            this.modal.addTab(2, 'ID');

            var idTabContent = this.add_remove_class_id.makeIDTabContent(id);
            var classTabContent = this.add_remove_class_id.makeClassTabContent(classes);

            var $tabBox1 = $('<div class="redactor-tab redactor-tab1">' + classTabContent + '</div>');
            var $tabBox2 = $('<div class="redactor-tab redactor-tab2">' + idTabContent + '</div>').hide();

            $modal.append($tabBox1);
            $modal.append($tabBox2);
            // end create modal tabs

            // call select2() after showing the modal
            $(".js-example-basic-multiple").select2();
        },
        changeBlock: function()
        {
            var addClass = $('#redactor-add-class').val();

            var removeClassArray = $('#redactor-remove-class').val();
            var removeClass = '';
            // if there are elements in removeClassArray
            // - join the array elements using a single space as a separator
            if (removeClassArray) {
                removeClass = removeClassArray.join(' ');
            }

            var addID = $('#redactor-add-id').val();
            var removeID = $('#redactor-remove-id').val();

            this.modal.close();
            this.selection.restore();

            this.buffer.set();

            // based on the current selection, get the parent block element
            // - if parent block element is not found, this.selection.getBlock() returns 'false'
            // this will get
            // - a block if the cursor is inside the block
            // - a partial internal selection of the block
            // - a full selection of the block
            var block = this.selection.getBlock();

            // if there is no parent block element, block will be false
            // if there is a parent block element, block will be true (the block element object)

            // if there is a parent block element
            // - add the class
            // - remove the class
            // - add/remove the ID
            // - remove the ID attribute if empty
            // - remove the class attribute if empty
            if (block) {
                this.block.setClass(addClass);
                this.block.removeClass(removeClass);

                if ((addID && removeID) || (addID && !removeID)) {
                    $(block).attr('id', addID);
                } else if (!addID && removeID) {
                    $(block).removeAttr('id');
                }

                this.utils.removeEmptyAttr(block, 'class');
            }

            this.code.sync();
        },

        // link
        showLinkModal: function()
        {
            var currentSelection = this.selection.getCurrent();

            // based on the current selection, get the closest link, then get its classes
            var classes = $(currentSelection).closest('a').attr('class');

            // based on the current selection, get the closest link, then get its ID
            var id = $(currentSelection).closest('a').attr('id');

            this.modal.addTemplate('link_modal', this.add_remove_class_id.classIDTemplate());

            this.modal.load('link_modal', 'Link', 400);
            this.modal.createCancelButton();

            var button = this.modal.createActionButton('update');
            button.on('click', this.add_remove_class_id.changeLink);

            this.selection.save();
            this.modal.show();

            // create modal tabs
            var $modal = this.modal.getModal();

            this.modal.createTabber($modal);
            this.modal.addTab(1, 'Class', 'active');
            this.modal.addTab(2, 'ID');

            var idTabContent = this.add_remove_class_id.makeIDTabContent(id);
            var classTabContent = this.add_remove_class_id.makeClassTabContent(classes);

            var $tabBox1 = $('<div class="redactor-tab redactor-tab1">' + classTabContent + '</div>');
            var $tabBox2 = $('<div class="redactor-tab redactor-tab2">' + idTabContent + '</div>').hide();

            $modal.append($tabBox1);
            $modal.append($tabBox2);
            // end create modal tabs

            // call select2() after showing the modal
            $(".js-example-basic-multiple").select2();
        },
        changeLink: function()
        {
            var addClass = $('#redactor-add-class').val();

            var removeClassArray = $('#redactor-remove-class').val();
            var removeClass = '';
            // if there are elements in removeClassArray
            // - join the array elements using a single space as a separator
            if (removeClassArray) {
                removeClass = removeClassArray.join(' ');
            }

            var addID = $('#redactor-add-id').val();
            var removeID = $('#redactor-remove-id').val();

            this.modal.close();
            this.selection.restore();

            this.buffer.set();

            var currentSelection = this.selection.getCurrent();

            // based on the current selection, get the closest link
            // this will get
            // - a link if the cursor is inside the link
            // - a partial internal selection of the link
            // - a full selection of the link
            var $linkInSelection = $(currentSelection).closest('a');

            // if there is no link in the selection, $linkInSelection.length will be 0
            // if there is a link in the selection, $linkInSelection.length will be 1

            // if there is a link in the selection
            // - add the class
            // - remove the class
            // - add/remove the ID
            // - remove the ID attribute if empty
            // - remove the class attribute if empty
            if ($linkInSelection.length) {
                $linkInSelection.addClass(addClass);
                $linkInSelection.removeClass(removeClass);

                if ((addID && removeID) || (addID && !removeID)) {
                    $linkInSelection.attr('id', addID);
                } else if (!addID && removeID) {
                    $linkInSelection.removeAttr('id');
                }

                this.utils.removeEmptyAttr($linkInSelection, 'class');
            }

            this.code.sync();
        },

        // image
        showImageModal: function()
        {
            var classes = $('.redactor-box .redactor-selected-image').attr('class');

            // if there is a class(s)
            if (classes) {
                // to prevent confusion, hide the "redactor-selected-image" class from users
                //
                // if "redactor-selected-image" is in the classes string
                // - replace it with an empty string
                // - trim white space
                if (classes.indexOf('redactor-selected-image') > -1) {
                    classes = classes.replace('redactor-selected-image', '');
                    classes.trim();
                }
            }

            var id = $('.redactor-box .redactor-selected-image').attr('id');

            // if there is an id
            if (id) {
                // to prevent confusion, hide the "image-marker" ID from users
                //
                // if "image-marker" is in the id string
                // - replace it with an empty string
                // - trim white space
                if (id.indexOf('image-marker') > -1) {
                    id = id.replace('image-marker', '');
                    id.trim();
                }
            }

            this.modal.addTemplate('image_modal', this.add_remove_class_id.classIDTemplate());

            this.modal.load('image_modal', 'Image', 400);
            this.modal.createCancelButton();

            var button = this.modal.createActionButton('update');
            button.on('click', this.add_remove_class_id.changeImage);

            this.selection.save();
            this.modal.show();

            // create modal tabs
            var $modal = this.modal.getModal();

            this.modal.createTabber($modal);
            this.modal.addTab(1, 'Class', 'active');
            this.modal.addTab(2, 'ID');

            var idTabContent = this.add_remove_class_id.makeIDTabContent(id);
            var classTabContent = this.add_remove_class_id.makeClassTabContent(classes);

            var $tabBox1 = $('<div class="redactor-tab redactor-tab1">' + classTabContent + '</div>');
            var $tabBox2 = $('<div class="redactor-tab redactor-tab2">' + idTabContent + '</div>').hide();

            $modal.append($tabBox1);
            $modal.append($tabBox2);
            // end create modal tabs

            // call select2() after showing the modal
            $(".js-example-basic-multiple").select2();
        },
        changeImage: function()
        {
            var addClass = $('#redactor-add-class').val();

            var removeClassArray = $('#redactor-remove-class').val();
            var removeClass = '';
            // if there are elements in removeClassArray
            // - join the array elements using a single space as a separator
            if (removeClassArray) {
                removeClass = removeClassArray.join(' ');
            }

            var addID = $('#redactor-add-id').val();
            var removeID = $('#redactor-remove-id').val();

            this.modal.close();
            this.selection.restore();

            this.buffer.set();

            var $selectedImage = $('.redactor-box .redactor-selected-image');

            // if there is no image in the selection, $selectedImage.length will be 0
            // if there is a image in the selection, $selectedImage.length will be 1

            // if there is an image in the selection
            // - add the class
            // - remove the class
            // - add/remove the ID
            // - remove the ID attribute if empty
            // - remove the class attribute if empty
            if ($selectedImage.length) {
                $selectedImage.addClass(addClass);
                $selectedImage.removeClass(removeClass);

                if ((addID && removeID) || (addID && !removeID)) {
                    $selectedImage.attr('id', addID);
                } else if (!addID && removeID) {
                    $selectedImage.removeAttr('id');
                }

                this.utils.removeEmptyAttr($selectedImage, 'class');
            }

            this.code.sync();
        },

        // table
        showTableModal: function()
        {
            var currentSelection = this.selection.getCurrent();

            // based on the current selection, get the closest table, then get its classes
            var classes = $(currentSelection).closest('table').attr('class');

            // based on the current selection, get the closest table, then get its ID
            var id = $(currentSelection).closest('table').attr('id');

            this.modal.addTemplate('table_modal', this.add_remove_class_id.classIDTemplate());

            this.modal.load('table_modal', 'Table', 400);
            this.modal.createCancelButton();

            var button = this.modal.createActionButton('update');
            button.on('click', this.add_remove_class_id.changeTable);

            this.selection.save();
            this.modal.show();

            // create modal tabs
            var $modal = this.modal.getModal();

            this.modal.createTabber($modal);
            this.modal.addTab(1, 'Class', 'active');
            this.modal.addTab(2, 'ID');

            var idTabContent = this.add_remove_class_id.makeIDTabContent(id);
            var classTabContent = this.add_remove_class_id.makeClassTabContent(classes);

            var $tabBox1 = $('<div class="redactor-tab redactor-tab1">' + classTabContent + '</div>');
            var $tabBox2 = $('<div class="redactor-tab redactor-tab2">' + idTabContent + '</div>').hide();

            $modal.append($tabBox1);
            $modal.append($tabBox2);
            // end create modal tabs

            // call select2() after showing the modal
            $(".js-example-basic-multiple").select2();
        },
        changeTable: function()
        {
            var addClass = $('#redactor-add-class').val();

            var removeClassArray = $('#redactor-remove-class').val();
            var removeClass = '';
            // if there are elements in removeClassArray
            // - join the array elements using a single space as a separator
            if (removeClassArray) {
                removeClass = removeClassArray.join(' ');
            }

            var addID = $('#redactor-add-id').val();
            var removeID = $('#redactor-remove-id').val();

            this.modal.close();
            this.selection.restore();

            this.buffer.set();

            var currentSelection = this.selection.getCurrent();

            // based on the current selection, get the closest table
            // this will get
            // - a table if the cursor is inside the table
            // - a partial internal selection of the table
            // - a full selection of the table
            var $table = $(currentSelection).closest('table');

            // if there is no table in the selection, $table.length will be 0
            // if there is a table in the selection, $table.length will be 1

            // if there is a table in the selection
            // - add the class
            // - remove the class
            // - add/remove the ID
            // - remove the ID attribute if empty
            // - remove the class attribute if empty
            if ($table.length) {
                $table.addClass(addClass);
                $table.removeClass(removeClass);

                if ((addID && removeID) || (addID && !removeID)) {
                    $table.attr('id', addID);
                } else if (!addID && removeID) {
                    $table.removeAttr('id');
                }

                this.utils.removeEmptyAttr($table, 'class');
            }

            this.code.sync();
        },
    };
};