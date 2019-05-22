
/*global zhcm:true */
sap.m.ObjectAttribute.extend("zhcm.ecert.appv.control.ObjectAttributeCustom", {
	metadata: {
		library: 'sap.m',
		properties: {
			icon: {
				type: 'sap.ui.core.URI',
				group: 'Misc',
				defaultValue: null
			},
			iconDensityAware: {
				type: 'boolean',
				group: 'Appearance',
				defaultValue: true
			},
			lineLimit: {
				type: 'int',
				group: 'Misc',
				defaultValue: 1
			},
			iconActive: {
				type: 'boolean',
				group: 'Misc',
				defaultValue: null
			}
		},
		defaultAggregation: 'content',
		aggregations: {
			content: {
				type: 'sap.ui.core.Control',
				multiple: true,
				singularName: 'content'
			}
		},
		events: {
			iconPress: {}
		}
	},
	renderer: "zhcm.ecert.appv.control.ObjectAttributeRendererCustom",
	init: function() {
		sap.m.ObjectAttribute.prototype.init.apply(this, arguments);
	}
});
zhcm.ecert.appv.control.ObjectAttributeCustom.prototype.setIcon = function(i) {
	var v = this.getIcon();
	if (i === null || i === undefined) {
		i = '';
	}
	if (v !== i) {
		var d = this.getDomRef('img');
		var s = !!d;
		if (sap.ui.core.IconPool.isIconURI(i) === sap.ui.core.IconPool.isIconURI(v)) {
			s = true;
		} else {
			s = false;
		}
		if (i.length === 0) {
			s = false;
		}
		this.setProperty('icon', i, s);
		if (s && this._image) {
			this._image.setSrc(i);
		}
	}
	return this;
};
zhcm.ecert.appv.control.ObjectAttributeCustom.prototype._getImageControl = function() {
	var i = this.getId() + '-icon';
	var p = {
		src: this.getIcon(),
		densityAware: this.getIconDensityAware()
	};
	this._oImageControl = sap.m.ImageHelper.getImageControl(i, this._oImageControl, this, p, ['upperTop']);
	return this._oImageControl;
};
zhcm.ecert.appv.control.ObjectAttributeCustom.prototype.ontap = function(e) {
	if (!!this.getActive() && (e.target.id !== this.getId())) {
		this.firePress({
			domRef: this.getDomRef()
		});
	}
	if (this.getIconActive() && (e.target.id !== this.getId() && e.target === this.getDomRef('icon'))) {
		this.fireIconPress({});
	}
};
zhcm.ecert.appv.control.ObjectAttributeCustom.prototype._getUpdatedTextControl = function() {
	var t = this.getAggregation('_textControl');
	var T = this.getTextDirection();
	var P = sap.ui.getCore().getConfiguration().getRTL();
	var m = this.getLineLimit();
	var o = '';
	if (T === sap.ui.core.TextDirection.LTR && P) {
		o = '\u200e';
	}
	if (T === sap.ui.core.TextDirection.RTL && !P) {
		o = '\u200f';
	}
	t.setProperty('text', (this.getTitle() ? this.getTitle() + ': ' : '') + o + this.getText() + o, true);
	t.setProperty('maxLines', m, true);
	t.onAfterRendering = function() {
		this.$().fewlines({
			'closeMark': 'Show Less',
			'openMark': 'Show More',
			'newLine': false,
			'lines': 3
		});
	};
	return t;
};