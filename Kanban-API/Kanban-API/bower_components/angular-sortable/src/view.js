/**
 * viewy-view 0.5.0
 * Copyright (c) 2014 Viewy Organization and Contributors
 * Released under the MIT license
 */

/**
 *  # viewy-view
 *    - JavaScript library that facilitates development of large scale client-side web applications with rich user interfaces
 *    - introduces a structural/architectural abstraction layer on top of common client-side web technology (HTML/CSS/JS)
 *    - inspired by and built around concepts found in native UI development
 *
 *  ## Concept
 *
 *  Examination of a view from different perspectives & definition of terminology:
 *
 *  ### View Component (architectural point of view)
 *    - a reusable component being instantiated at runtime
 *    - consists of a view controller and a bundle
 *    - behavior and styling may be extended/overridden/customized by inheritance/cascading
 *
 *  ### View Controller (runtime/behavior point of view)
 *    - Constructor and prototype object providing common behavior across all instances of a view component
 *
 *  ### View Bundle (resource/graphical representation point of view)
 *    - collection of resources providing means for a common graphical representation across all instances of a view component
 *    - e.g. HTML markup, CSS stylesheet, media resources (e.g. images/audio/video)
 *
 *  ### View (general/runtime/instance point of view)
 *    - concrete instance of a view component
 *    - self-contained/self-managed piece of UI, most like a widget
 *    - scoping: managed DOM subtree that has scoped styling and behavior
 *    - composition: view instances can be in a parent/child relationship meaning that a view may have one or more other views nested inside of itself. This results in a tree structure, the "View Hierarchy"
 *    - lifecycle: a view has a lifecycle (construction/instantiation, loading, [showing, hiding, doing stuff], unloading, deallocation)
 *    - memory management
 *
 *  @author Andreas Tietz
 *  @module viewy-view
 *  @requires requirejs, jquery
 */
(function (factory) {
    'use strict';

    // Define this module and it's dependencies via RequireJS if possible:
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    // Otherwise export to node if possible:
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(jQuery);
    // Otherwise define in the global scope:
    } else {
        window.View = factory(jQuery);
    }
}(function ($) {
    'use strict';

    /**
     *  Base implementation of a view controller providing scoped and configurable behavior across all instances of a view component.
     *
     *  @class View
     *  @constructor
     */
    function View(config) {
        var self = this;

        // Lazily initialize the config hash:
        config = config || {};

        // Initially assign properties from config:
        self.name(config.name);
        self.bundle(config.bundle);
        self.parentView(config.parentView);
        self.childViews(config.childViews);
        self.onViewDidLoad().subscribe(config.onViewDidLoad);
        self.onViewWillUnload().subscribe(config.onViewWillUnload);
    }

    /**
     *  General configuration:
     */
    View.config = {
        // Whether or not to warn about the loading of root views that might be views being detached from the view hierarchy by mistake:
        ENABLE_ROOT_VIEW_WARNING: true
    };

    /*
     *  Inheritance
     */

    /**
     *  Helper function that facilitates prototypal inheritance from Views.
     *
     *  Note: Assign a name to the passed in constructor function in order for it to be correctly printed out in console logs.
     *
     *  @method extend
     *  @param {Mixed} [extension] Prototype attributes and methods being added to the view prototype to be inherited from.
     *  @return {Function} Constructor of the extended/inherited view.
     *  @example
     *      var MyView = View.prototype.extend({
     *          constructor: function MyView (config) {..},
     *          viewDidLoad: function () {..},
     *          myNewFunction: function () {..}
     *          myNewAttribute: ..
     *          ...
     *      };
     */
    View.prototype.extend = function (extension) {
        var self = this;

        // Configure extension defaults:
        extension = $.extend({
            constructor: function (config) { self.super.constructor.call(this, config); },
        }, extension);

        // Copy constructor properties:
        for (var key in self.constructor) {
            if ({}.hasOwnProperty.call(self.constructor, key)) extension.constructor[key] = self.constructor[key];
        }

        // Build prototype constructor (avoids calling extension.constructor):
        function PrototypeConstructor() {
            this.constructor = extension.constructor;
        }
        PrototypeConstructor.prototype = self.constructor.prototype;

        // Inherit prototype:
        extension.constructor.prototype = new PrototypeConstructor();
        extension.constructor.prototype.super = self.constructor.prototype;

        // Merge additional extensions into prototype:
        $.extend(extension.constructor.prototype, extension);

        return extension.constructor; // assignment is optional
    };

    /*
     *  Lifecycle inheritance interface/notification hooks
     */

    /**
     *  Function being called on the view itself when the "view did load" event occurs.
     *
     *  Inherited views may override and implement this function.
     *
     *  @method viewDidLoad
     */
    View.prototype.viewDidLoad = function () {
        // optionally override and implement in inherited view
    };

    /**
     *  Function being called on the view itself when the "view will unload" event occurs.
     *
     *  Inherited views may override and implement this function.
     *
     *  @method viewWillUnload
     */
    View.prototype.viewWillUnload = function () {
        // optionally override and implement in inherited view
    };

    /*
     *  Public properties
     */

    /**
     *  Helper function for defining accessors.
     *
     *  @method defineAccessors
     *  @param {Mixed} [accessors] Object defining {set: and get:} accessors.
     */
    View.prototype.definePropertyAccessors = function (name, accessors) {
        return function () {
            // Invoke getter:
            if (arguments.length === 0) {
                if (accessors && accessors.get) {
                    return accessors.get.apply(this);
                } else {
                    throw new Error(this + '->' + name + '(): Getter is not implemented.');
                }
            // Invoke setter:
            } else {
                if (accessors && accessors.set) {
                    return accessors.set.apply(this, $.makeArray(arguments));
                } else {
                    throw new Error(this + '->' + name + '(...): Setter is not implemented, property is read only.');
                }
            }
        };
    };

    /**
     *  Unique name for the view to be distinguished from other views at the same hierarchy level.
     *
     *  @property name
     *  @type String
     *  @default undefined
     */
    View.prototype.name = View.prototype.definePropertyAccessors('name', {
        get: function () { return this._name; },
        set: function (name) {
            if (this.isLoaded()) throw new Error(this + '->name("' + name + '"): Cannot change property while view is loaded.');
            this._name = name;
        }
    });

    /**
     *  HTML & CSS module/filenames.
     *
     *  @property bundle
     *  @type String
     *  @default undefined
     */
    View.prototype.bundle = View.prototype.definePropertyAccessors('bundle', {
        get: function () { return this._bundle; },
        set: function (bundle) {
            if (this.isLoaded()) throw new Error(this + '->bundle("' + bundle + '"): Cannot change property while view is loaded.');
            this._bundle = bundle;
        }
    });

    /**
     *  Parent view up the view hierarchy that "owns" the view.
     *
     *  @property parentView
     *  @type View
     *  @default undefined
     */
    View.prototype.parentView = View.prototype.definePropertyAccessors('parentView', {
        get: function () { return this._parentView; },
        set: function (parentView) {
            if (this.isLoaded()) throw new Error(this + '->parentView( ' + parentView + ' ): Cannot change property while view is loaded.');
            if (this._parentView) this._parentView.removeChildView(this); // remove view from current parent view
            this._parentView = parentView;
            if (typeof this._parentView !== 'undefined') {
                this._parentView._childViews.push(this); // TODO: only add if not already there
            }
        }
    });

    /**
     *  Direct child views down the view hierarchy "owned" by the view.
     *
     *  Setter does not actually load child views.
     *
     *  @property childViews
     *  @type Array of Views
     *  @default []
     */
    View.prototype.childViews = View.prototype.definePropertyAccessors('childViews', {
        get: function () { return this._childViews || []; },
        set: function (newChildViews) {
            var self = this;

            // Lazily initialize:
            self._childViews = self._childViews || [];
            newChildViews = newChildViews || [];

            // Unload and detach existing child views from view hierarchy:
            self.removeAllChildViews();

            // Add new child views:
            $.each(newChildViews, function (index, newChildView) {
                self.addChildView(newChildView);
            });
        }
    });

    /**
     *  Determines whether the view is the first view in a view hierarchy and therefore has no parent view.
     *  This is a purely calculated property.
     *
     *  @property isRootView
     *  @type Boolean
     */
    View.prototype.isRootView = View.prototype.definePropertyAccessors('isRootView', {
        get: function () { return this.parentView() === undefined; }
    });

    /**
     *  Determines whether the view's DOM is currently loaded.
     *  This is a purely calculated property.
     *
     *  @property isLoaded
     *  @readOnly
     *  @type Boolean
     */
    View.prototype.isLoaded = View.prototype.definePropertyAccessors('isLoaded', {
        get: function () {
            // true if _viewElement and _containerElement exist:
            return (this._viewElement !== undefined && this._viewElement.length > 0 &&
                    this._containerElement !== undefined && this._containerElement.length > 0);
        }
    });

    /**
     *  Subscription for "view did load" events.
     *
     *  @property onViewDidLoad
     *  @type Mixed
     *  @default {
     *               subscribe: Function
     *               unsubscribe: Function
     *           }
     */
    View.prototype.onViewDidLoad = View.prototype.definePropertyAccessors('onViewDidLoad', {
        get: function () {
            this._onViewDidLoadCallbacks = this._onViewDidLoadCallbacks || $.Callbacks('unique memory');
            return {
                subscribe: this._onViewDidLoadCallbacks.add,
                unsubscribe: this._onViewDidLoadCallbacks.remove
            };
        },
        set: function (subscription) {
            this._onViewDidLoadCallbacks = this._onViewDidLoadCallbacks || $.Callbacks('unique memory');
            subscription && subscription.subscribe && this._onViewDidLoadCallbacks.add(subscription.subscribe);
        }
    });

    /**
     *  Subscription for "view will unload" events.
     *
     *  @property onViewWillUnload
     *  @type Mixed
     *  @default {
     *               subscribe: Function
     *               unsubscribe: Function
     *           }
     */
    View.prototype.onViewWillUnload = View.prototype.definePropertyAccessors('onViewWillUnload', {
        get: function () {
            this._onViewWillUnloadCallbacks = this._onViewWillUnloadCallbacks || $.Callbacks('unique memory');
            return {
                subscribe: this._onViewWillUnloadCallbacks.add,
                unsubscribe: this._onViewWillUnloadCallbacks.remove
            };
        },
        set: function (subscription) {
            this._onViewWillUnloadCallbacks = this._onViewWillUnloadCallbacks || $.Callbacks('unique memory');
            subscription && subscription.subscribe && this._onViewWillUnloadCallbacks.add(subscription.subscribe);
        }
    });

    /*
     *  Private attributes
     */

    /**
     *  Backup copy of the original container element to be restored when unloading.
     *
     *  @property _containerElement
     *  @private
     *  @type jQuery Element
     */
    View.prototype._containerElement;

    /**
     *  Loaded view root DOM node (replacement of the original container element).
     *
     *  @property _viewElement
     *  @private
     *  @type jQuery Element
     */
    View.prototype._viewElement;

    /*
     *  View hierarchy management
     */

    /**
     *  Adds a view to the view hierarchy as a direct child. Does not actually load the child view.
     *
     *  @method addChildView
     *  @param {View} newChildView Child view to be added.
     *  @return {View} Added child view.
     */
    View.prototype.addChildView = function (newChildView) {
        var self = this;

        // Lazily initialize:
        self._childViews = self._childViews || [];

        // Look for a conflicting child view that wants to occupy the same container as newChildView:
        $.each(self._childViews, function (index, existingChildView) {
            // Note: We don't want to have a conflict if existingChildView.name and newChildView.name are both undefined.
            if (existingChildView.name() && existingChildView.name() === newChildView.name()) {
                throw new Error(self + '->addChildView( ' + newChildView + ' ): Another child view ' + existingChildView + ' already occupies the same view container.');
            }
        });

        // Connect parent/child relationship:
        newChildView.parentView(self);

        // Allow for chaining a call to load the new child view:
        return newChildView;
    };

    /**
     *  Removes a direct child view from the view hierarchy. Unloads the child view if necessary.
     *
     *  @method removeChildView
     *  @param {View} childView Child view to be removed.
     */
    View.prototype.removeChildView = function (childView) {
        var self = this;

        // Lazily initialize:
        self._childViews = self._childViews || [];

        var index = self._childViews.indexOf(childView);

        // If childView is in fact a child view:
        if (index !== -1) {

            // Unload from DOM:
            childView.unload();

            // Detach parent/child relationship:
            childView._parentView = undefined;
            self._childViews.splice(index, 1);
        // Throw an error if the view is not a child view:
        } else {
            throw new Error(self + '->removeChildView( ' + childView + ' ): View is not a child view.');
        }
    };

    /**
     *  Removes all direct child view from the view hierarchy. Unloads child views if necessary.
     *
     *  @method removeAllChildViews
     */
    View.prototype.removeAllChildViews = function () {
        var self = this;

        // Lazily initialize:
        self._childViews = self._childViews || [];

        // Unload and detach child->parent references:
        $.each(self._childViews, function (index, existingChildView) {
            existingChildView.unload();
            existingChildView._parentView = undefined;
        });
        // Detach parent->child references:
        self._childViews.length = 0;
    };

    /**
     *  Removes the view from the parent view hierarchy (behaves the same as removeChildView). Unloads the view if necessary.
     *
     *  @method removeFromParentView
     */
    View.prototype.removeFromParentView = function () {
        var self = this;
        if (!self._parentView) {
            throw new Error(self + '->removeFromParentView(): View has no parent view.');
        }
        self._parentView.removeChildView(self);
    };

    /*
     *  Markup/DOM management
     */

    /**
     *  Performs a jQuery selector scoped to the root element of a loaded view.
     *
     *  @method $
     *  @param {String} [selector] jQuery selector being scoped to the root element.
     *  @return {jQuery Element} Root element of a loaded view if invoked without a parameter,
     *                           scoped jQuery selection result if invoked with a selector
     *                           or undefined if the view is not loaded.
     */
    View.prototype.$ = function (selector) {
        // TODO: don't select deeper than the parent view (ignore inner DOM of child views)
        var self = this;
        if (self.isLoaded()) {
            return selector ? self._viewElement.find(selector) : self._viewElement;
        } else { // view not loaded
            if (selector) { // selector specified
                throw new Error(self + '->$("' + selector + '"): View is not loaded.');
            } else { // selecting root element
                return []; // view is not loaded
            }
        }
    };

    /**
     *  Loads markup and styles from HTML and CSS files specified by the bundle property into the container element identified by the name property.
     *
     *  @method load
     *  @return {jQuery Deferred Promise} Promise for the "view did load" state.
     */
    View.prototype.load = function () {
        var self = this;

        // Skip if parent view is not loaded yet:
        if (self.parentView() && !self.parentView().isLoaded()) {
            throw new Error(self + '->load(): Parent view is not loaded yet.');
        }

        // A unique name must be configured so that the view instance can be distinguished from other views at the same hierarchy level:
        if (!self.name()) {
            throw new Error(self + '->load(): Name not specified.');
        }

        // A bundle must be configured (it must match a valid requirejs module id later on):
        if (!self.bundle()) {
            throw new Error(self + '->load(): (HTML/CSS)-bundle not specified.');
        }

        // Warn about loading a root view if desired:
        if (self.isRootView() && View.config && View.config.ENABLE_ROOT_VIEW_WARNING) {
            console.warn(self + '->load(): View will be loaded as a root view. (It is detached from any view hierarchy because it has no parent view.)');
        }

        // If the view is already loaded, unload from currently occupied container element so that a reload is possible:
        self.unload();

        // View is not loaded, so get a backup of the root (container) element identified by [data-view-name] for later use:
        // TODO: don't select deeper than the parent view (ignore inner DOM of child views)
        var containerElementSelector = '[data-view-name="' + self.name() + '"]';
        self._containerElement = ( self.parentView() ? self.parentView().$(containerElementSelector) : $(containerElementSelector) );

        // In order for a view to get loaded, a valid container element must be existent:
        if (self._containerElement.length === 0) {
            throw new Error(self + '->load(): Container element not specified or not existent.');
        }

        // Forbid the view to take over a container that's already hosting another view:
        if (self._containerElement.children().length > 0 && self._containerElement.data('view')) {
            throw new Error(self + '->load(): Container is currently occupied by another view: ' + self._containerElement.data('view') + '. Unload this view explicitly before attempting to load another view into the same container.');
        }

        // If a parent view is configured, make sure that:
        // - the container element is a descendant of the parent view's DOM
        // - the container element is not a descendant of any parent view's other child view containers
        if (self.parentView()) {
            if (self._containerElement.parents().index(self.parentView()._viewElement) < 0) {
                throw new Error(self + '->load(): Container element must be a descendant of the parent view\'s DOM.');
            }
            if (self._containerElement.parents().index(self.parentView()._viewElement.find('[data-view-container]')) >= 0) {
                throw new Error(self + '->load(): Container element must not be a descendant of any other child view container inside the parent view\'s DOM.');
            }
        }

        var viewDidLoad = $.Deferred();

        // Load equally named HTML markup and CSS stylesheet files via require loader plugins (they can only be loaded paired/they must have the same file name):
        require(['html!' + self.bundle() + '.html', 'css!' + self.bundle()], function (html, css) {

            // The new view element is based on the container element:
            self._viewElement = self._containerElement;

            // Retain a copy of the original container element for restoring upon unloading:
            self._containerElement = self._containerElement.clone();

            // Replace the container element with the loaded view's root element:
            var $html = $(html);
            self._viewElement.replaceWith($html);
            self._viewElement = $html;

            // Copy the original container's properties over to the view element:
            self._viewElement.addClass(self._containerElement[0].className);
            self._viewElement.attr('data-view-name', self._containerElement.attr('data-view-name'));

            // Set type of view controller for scoping purposes:
            self._viewElement.attr('data-view-controller', self.constructor.name);

            // Set reference in the occupied container element:
            self._viewElement.data('view', self);

            // Call "did load" notification on self and on subscribed stakeholders:
            self.viewDidLoad();
            self._onViewDidLoadCallbacks.fire(self);
            viewDidLoad.resolve(self);

            // Load child views recursively:
            $.each(self.childViews(), function (index, childView) {
                childView.load();
            });
        });

        // Return "did load" promise:
        return viewDidLoad.promise();
    };

    /**
     *  Unloads the DOM by restoring the originally occupied container element.
     *
     *  @method unload
     *  @return {jQuery Deferred Promise} Promise for the "view will unload" state.
     */
    View.prototype.unload = function () {
        var self = this;

        var viewWillUnload = $.Deferred();

        // Unload only if loaded:
        if (self.isLoaded()) {

            // Unload child views recursively down the view hierarchy:
            $.each(self.childViews(), function (index, childView) {
                childView.unload();
            });

            // Call "will unload" notification on self and on subscribed stakeholders:
            self.viewWillUnload();
            self._onViewWillUnloadCallbacks.fire(self);
            viewWillUnload.resolve(self);

            // Remove reference from the occupied container element:
            self._viewElement.removeData('view');

            // Delete the view's DOM by restoring the original container element:
            self._viewElement.replaceWith(self._containerElement);

            // Release DOM references:
            self._containerElement = undefined;
            self._viewElement = undefined;
        }

        // Return "will unload" promise:
        return viewWillUnload.promise();
    };

    /*
     *  Debugging
     */

    /**
     *  Provides a human readable string representation of a view.
     *
     *  @method toString
     *  @return {String} String representation of the view.
     *  @example
     *      Format: "[<controller/constructor name>&<bundle name>@<path in hierarchy represented by container element names>:<loaded or !loaded>]"
     *      Output: "[View&TestView@root/a/b/c/d:!loaded]"
     */
    View.prototype.toString = function () {
        var self = this;
        var str = '[' + self.constructor.name + (self.constructor.name === self.bundle() ? '' : '&' + self.bundle());
        str += '@' + self.getPathInHierarchy();
        str += (self.isLoaded()) ? ':loaded' : ':!loaded';
        str += ']';
        return str;
    };

    /**
     *  Recursively traverses down the child view hierarchy of a view while invoking
     *  a function for each view passing it the view and the recursion level.
     *
     *  @method traverse
     *  @param {Function} fn Function being invoked for each view and being passed the view object and the recursion level.
     *  @param {Number} level Indicates the current level of recursion.
     */
    View.prototype.traverse = function (fn, level) {
        var self = this;
        if (level === undefined) level = 0;
        fn(self, level);
        $.each(self.childViews(), function (index, childView) {
            childView.traverse(fn, level + 1);
        });
    };

    /**
     *  Provides a human readable string representation of the current state of the child view hierarchy.
     *
     *  @method getViewHierarchyHumanReadable
     *  @return {String} String representation of the child view hierarchy.
     *  @example
     *      Output:
     *      "[View&TestView1@root:loaded]
     *       |--> [View&TestView2@root/a:!loaded]
     *       |--> [View&TestView3@root/b:!loaded]"
     */
    View.prototype.getViewHierarchyHumanReadable = function () {
        var self = this;
        var hierarchyOutput = '';
        self.traverse(function (view, level) {
            for (var i = 1; i < level; i++) hierarchyOutput += '|    ';
            if (level > 0) hierarchyOutput += '|--> ';
            hierarchyOutput += view + '\n';
        });
        return hierarchyOutput;
    };

    /**
     *  Provides a human readable string representation of the view path inside the
     *  hierarchy represented by container element names starting with the root view.
     *
     *  @method getPathInHierarchy
     *  @return {String} String representation of the view path inside the hierarchy.
     *  @example
     *      View hierarchy (container element names):
     *      root
     *      |-> a
     *      |   |-> c
     *      |       |-> d
     *      |-> b
     *
     *      console.log(d.getViewHierarchyHumanReadable());
     *      Output: "root/a/c/d"
     */
    View.prototype.getPathInHierarchy = function () {
        var self = this;
        var pathOutput = self.name();
        var parentView = self.parentView();
        while(parentView) {
            pathOutput = parentView.name() + '/' + pathOutput;
            parentView = parentView.parentView();
        }
        return pathOutput;
    };

    // Return the constructor as the module value:
    return View;
}));
