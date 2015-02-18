goog.provide('rsz.App');

goog.require('rsz.Toolbar');
goog.require('rsz.Stage');
goog.require('rsz.Wysiwyg');
goog.require('rsz.Responsizer');
goog.require('rsz.FileService');


/**
 * @class
 * this is the entry point of Responsize web app
 * an instance of this class is created in src/index.js at start
 */
class App {
  /**
   * @constructor
   * @param {Element} element
   */
  constructor(element) {

    /**
     * @type {Toolbar}
     */
    this.toolbar= new Toolbar(element.querySelector('#toolbar'));


    /**
     * @type {Stage}
     */
    this.stage = new Stage(element.querySelector('#stage'));


    /**
     * @type {Wysiwyg}
     */
    this.wysiwyg = new Wysiwyg();


    /**
     * @type {Responsizer}
     */
    this.responsizer = new Responsizer();


    /**
     * @type {FileService}
     */
    this.fileService= new FileService();


    // bind components together
    this.toolbar.onSize = (w, h) => this.stage.setSize(w, h);
    this.toolbar.onOpen = () => this.fileService.open().then((url) => this.onOpen(url));
    this.toolbar.onSave = () => this.fileService.save(
			this.wysiwyg.getCleanHtml()).then(() => this.onSave());
    // selection
    this.wysiwyg.selectFilter = (element) => {return this.hasSiblings(element)};
    this.wysiwyg.onSelect = () => {
      this.toolbar.setSelection(this.wysiwyg.getSelected());
      this.toolbar.setDirty(true);
    };
    // resize
    this.wysiwyg.filterBoundingBox = (element, rect) => {
      this.toolbar.setDirty(true);
      this.responsizer.setWidth(
        element,
        rect.right - rect.left,
        this.stage.getSize().width);
      // prevent resize from the Wysiwyg class
      return null;
    };
    this.wysiwyg.onResized = () => {
    };

    // init
    this.wysiwyg.setSelectionMode(true);
    this.wysiwyg.setResizeMode(true);
    this.toolbar.setDevice(Device.desktop);

    // iframe / wysiwyg style sheet
    this.wysiwyg.addTempStyle(window.location.href + 'iframe.css');
 }


  /**
   * counts the number of siblings of type Element
   * @return {boolean} true if the element has siblings
   * @export
   */
  hasSiblings(element) {
    if(element && element.parentNode && element.parentNode.childNodes) {
      let numChildren = 0;
      for(let idx in element.parentNode.childNodes) {
        let el = element.parentNode.childNodes[idx];
        if(el.nodeType === 1) {
          numChildren++;
        }
      }
      return numChildren > 1;
    }
    return false;
  }


  /**
   * a file has been chosen by the user in cloud explorer
   * @param {string} url
   */
  onOpen(url) {
    this.stage.setUrl(url).then((doc) => {
      this.wysiwyg.setDocument(doc);
      this.toolbar.setSelection([]);
    });
  }


  /**
   * a file has been saved with cloud explorer
   */
  onSave() {
		this.toolbar.setDirty(false);
  }
}

