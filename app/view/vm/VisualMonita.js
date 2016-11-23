Ext.define('Sencha_Draw.view.vm.VisualMonita', {
  extend: 'Ext.container.Container',

  requires: [
    'Sencha_Draw.view.vm.VisualMonita_Controller',
		'Sencha_Draw.view.vm.test.LockGridView',
    'Sencha_Draw.view.vm.item.hmi-items',
    'Sencha_Draw.view.vm.uploaded_item.hmi-items',
    'Sencha_Draw.view.vm.PropertyGrid',
    'Ext.ux.WebSocket',
    'Ext.ux.WebSocketManager',
    'Ext.ux.form.MultiFile'
  ],

  xtype: 'visual-monita',
	itemId: 'parent',
  controller: 'vm',

  layout: {
    type: 'border'
  },

  listeners: {
    boxReady: 'onBoxReady'
  },

  items: [{
    xtype: 'panel',
    title: '<h2>Visual Monita</h2>',
    region: 'north'
  }, {
    xtype: 'form',
    reference: 'p_webSocket',
    title: 'JSON Data from WebSocket',
    region: 'west',
    width: 450,
    split: true,
    collapsible: true,
    collapsed: true,
    bodyPadding: 10,
    floatable: false,
    items:[{
      xtype: 'fieldcontainer',
      layout: 'hbox',
      anchor: '100%',
      items: [{
        xtype: 'textfield',
        name: 'URL',
        value: 'ws://119.18.154.235:1234',
        flex: 1,
    		fieldLabel: 'WebSocket URL',
    		listeners: {
    			specialKey: 'onSpecialKey'
    		}
      }, {
        xtype: 'button',
        text: 'Connect',
        listeners: {
          click: 'openConnection'
        }
      }, {
        xtype: 'button',
        text: 'Disconnect',
        listeners: {
          click: 'closeConnection'
        }
      }]
  	}, {
      xtype: 'textarea',
      itemId: 'result',
      anchor: '100%',
      height: '100%',
      width: '100%',
      fieldLabel: 'Respone From WebSocket',
      labelAlign: 'top'
    }]
  }, {
    region: 'center',
    xtype: 'tabpanel',
    items:[{
      title: 'Editor',
			xtype: 'container',
			layout: {
				type: 'border',
				align: 'stretch'
			},
			items: [{
				xtype: 'panel',
				itemId: 'canvas',
				region: 'center',
        id: 'CanvasID',
        dockedItems: [{
          xtype: 'toolbar',
          dock: 'top',
          items: [{
            xtype: 'button',
            text: 'Save Visual Monita',
            listeners: {
              click: 'onSaveVisualMonita'
            }
          }, {
            xtype: 'button',
            text: 'Load Visual Monita',
            listeners: {
              click: 'onloadVisualMonitaEditor'
            }
          }]
        }, {
          xtype: 'toolbar',
          dock: 'bottom',
          items: [{
  					xtype: 'textfield',
  					itemId: 'object_posx',
          	fieldLabel: 'X',
            listeners: {
              specialKey: 'onToolbarObjectValueChange'
            }
  				}, {
  					xtype: 'textfield',
  					itemId: 'object_posy',
          	fieldLabel: 'Y',
            listeners: {
              specialKey: 'onToolbarObjectValueChange'
            }
  				}, {
  					xtype: 'textfield',
  					itemId: 'object_height',
          	fieldLabel: 'Height',
            listeners: {
              specialKey: 'onToolbarObjectValueChange'
            }
  				}, {
            xtype: 'textfield',
  					itemId: 'object_width',
          	fieldLabel: 'Width',
            listeners: {
              specialKey: 'onToolbarObjectValueChange'
            }
      		}]
        }],
        viewModel: {
          data: {
            x_object: ''
          }
        },
				listeners: {
					el: {
						mousemove: function(me, e, eOpts) {
              var parent = Ext.ComponentQuery.query('#canvas')[0];
              if (parent.getViewModel().get('x_object') != '') {
                var AllObject = Ext.ComponentQuery.query('#canvas > panel');
                for (var i = 0; i < Object.keys(AllObject).length; i++) {
                  if (AllObject[i].getId() == parent.getViewModel().get('x_object')) {
                    AllObject[i].el.setStyle({backgroundImage: 'url(border-image.png)', backgroundRepeat: 'no-repeat'});
                    // AllObject[i].el.setStyle({backgroundColor: '#c1ddf1', padding: '10px'});
                  } else {
                    AllObject[i].el.setStyle({backgroundImage: 'url(border-image-null.png)'});
                    // AllObject[i].el.setStyle({backgroundColor: '#fff'});
                  }
                }
                var object = Ext.getCmp(parent.getViewModel().get('x_object'));
  							if (object.getViewModel().get('x_drag')) {
                  if (object.getHeader()) {
                    object.setPagePosition(me.getX()-(object.getWidth()/2), me.getY()-20);
                  } else {
                    object.setPagePosition(me.getX()-(object.getWidth()/2), me.getY()-(object.getHeight()/2));
                  }

                  var o_posX = Ext.ComponentQuery.query('#object_posx')[0]; o_posX.setValue(object.getX());
                  var o_posY = Ext.ComponentQuery.query('#object_posy')[0]; o_posY.setValue(object.getY());
                  var o_height = Ext.ComponentQuery.query('#object_height')[0]; o_height.setValue(object.getHeight());
                  var o_width = Ext.ComponentQuery.query('#object_width')[0]; o_width.setValue(object.getWidth());
  							}
              }
						},
            contextmenu: 'onCanvasRightClick'
					}
				},
        scrollable: true
			}, {
        region: 'east',
        xtype: 'panel',
        title: 'Item Properties',
        split: true,
				collapsible: true,
				collapsed: false,
        floatable: false,
				width: 300,
        items: [{
          xtype: 'vm-property-grid',
          itemId: 'properties',
        }]
      }, {
        region: 'west',
        xtype: 'panel',
        title: 'HMI Items',
        layout: 'accordion',
				split: true,
				collapsible: true,
				collapsed: false,
        floatable: false,
				width: 250,
        items: [{
          xtype: 'hmi-grid',
          title: 'On Local'
        }, {
          xtype: 'hmi-uploaded-grid',
          itemId: 'uploadedGrid',
          title: 'Uploaded Items',
          listeners: {
            itemcontextmenu: function(me, record, item, index, e, eOpts) {
              var item =  record.getData()['uploaded-Items'];
              e.stopEvent();
              Ext.create('Ext.menu.Menu', {
                width: 100,
                plain: true,
                floating: true,
                renderTo: Ext.getBody(),
                items: [{
                  text: 'Delete Item',
                  handler: function() {
                    console.log('delete item clicked');
                    Ext.Msg.show({
                      title:'Delete Item',
                      message: 'Delete last click item ??',
                      buttons: Ext.Msg.YESNO,
                      icon: Ext.Msg.QUESTION,
                      fn: function(btn) {
                        if (btn === 'yes') {
                          Ext.Ajax.request({
                            url: 'delete.php',
                            params: {
                              data: item
                            },
                            success: function(response) {
                              var grid = Ext.ComponentQuery.query('#uploadedGrid')[0];
                              grid.getStore().reload();
                            }
                          });
                        }
                      }
                    });
                  }
                }]
              }).showAt(e.getXY());
            }
          },
          tbar: [{
            text: 'Add HMI Items',
            handler: function () {
              var win = Ext.widget({
                xtype: 'window',
                title: 'Files upload form',
                width: 350,
                autoShow: true,
                modal: true,
                items: {
                  xtype: 'form',
                  border: false,
                  bodyStyle: {
                    padding: '10px'
                  },
                  items: {
                    xtype: 'filefield',
                    name: 'new_item[]',
                    hideLabel: true,
                    allowBlank: false,
                    anchor: '100%',
                    buttonText: 'Browse Items...',
                    listeners: {
                      render: function(cmp) {
                        cmp.fileInputEl.set({
                          multiple: true,
                          accept: '.png, .gif, .svg'
                        });
                      }
                    }
                  }
                },
                buttons: [{
                  text: 'Upload',
                  handler: function() {
                    var form = win.down('form').getForm();
                    if (form.isValid()) {
                      form.submit({
                        url: 'test_upload.php',
                        waitMsg: 'Uploading item(s)...',
                        success: function(fp, o) {
                          Ext.Msg.alert('Success', 'Item "' + o.result.file + '" has been uploaded.');
                          win.close();
                          var grid = Ext.ComponentQuery.query('#uploadedGrid')[0];
                          grid.getStore().reload();
                        },
                        failure: function(fp, o) {
                          Ext.Msg.alert('Failure', o.result.file || ' - server error', function () {
                            win.close();
                          });
                        }
                      });
                    }
                  }
                },{
                  text: 'Cancel',
                  handler: function () {
                    win.close();
                  }
                }]
              });
            }
          }, {
            text: 'Refresh',
            handler: function() {
              var grid = Ext.ComponentQuery.query('#uploadedGrid')[0];
              grid.getStore().reload();
            }
          }]
        }]
      }, {
				region: 'south',
				xtype: 'locking-grid',
				itemId: 'tableVisMon',
				split: true,
				collapsible: true,
				collapsed: true,
        floatable: false,
				height: 300,
				title: 'Table Data Visual Monita',
				autoLoad: true,
				autoRender: true,
				autoShow: true
			}]
  	}, {
			xtype: 'panel',
			title: 'Visal Monita',
      id: 'visual_monita',
      itemId: 'visual_monita',
      scrollable: true,
      dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: [{
          xtype: 'button',
          text: 'Load Visual Monita',
          listeners: {
            click: 'onloadVisualMonita'
          }
        }]
      }],
  	}]
  }]
});
