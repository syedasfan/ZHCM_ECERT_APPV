/*
 * @copyright
 */
jQuery.sap.require("zhcm.ecert.appv.ext.fewlines");
sap.ui.define(['jquery.sap.global'], function(q) {
	'use strict';
	var O = {};
	O.render = function(r, o) {
		if (!o._isEmpty()) {
			var p = o.getParent(),
				t = o.getTextDirection();
			r.write('<div');
			r.writeControlData(o);
			r.addClass('sapMObjectAttributeDiv');
			if (o.getIcon()){
			    r.addClass('customObjAttr');
			}
			if (o.getActive()) {
				r.addClass('sapMObjectAttributeActive');
				r.writeAttribute('tabindex', '0');
			}
			r.writeClasses();
			var T = o.getTooltip_AsString();
			if (T) {
				r.writeAttributeEscaped('title', T);
			}
			if (o.getActive()) {
				r.writeAccessibilityState(o, {
					role: 'link'
				});
			}
			r.write('>');

			//add the custom icon
			if (o.getIcon()) {
				//r.write('<button ');
				//	r.addClass('sapMBtn sapMBtnBase sapMBtnInverted');
				r.write('<div');
				r.addClass('sapMObjAttrIcon');
				r.writeClasses();
				r.write('>');
				r.renderControl(o._getImageControl());
				r.write('&nbsp;&nbsp;');
				r.write('</div>');
				//	r.write('</button> ');
			}

			if (p && (p instanceof sap.m.ObjectHeader)) {
				if (o.getProperty('title')) {
					r.write("<span id=\"" + o.getId() + "-title\"");
					r.addClass('sapMObjectAttributeTitle');
					r.writeClasses();
					r.write('>');
					r.writeEscaped(o.getProperty('title'));
					r.write('</span>');
					r.write("<span id=\"" + o.getId() + "-colon\"");
					r.addClass('sapMObjectAttributeColon');
					r.writeClasses();
					r.write('>');
					r.write(':&nbsp;');
					r.write('</span>');
				}
				r.write("<span id=\"" + o.getId() + "-text\"");
				r.addClass('sapMObjectAttributeText');
				if (t && t !== sap.ui.core.TextDirection.Inherit) {
					r.writeAttribute('dir', t.toLowerCase());
				}
				r.writeClasses();
				r.write('>');
				r.writeEscaped(o.getProperty('text'));
				r.write('</span>');
			} else {
				// 			    if (o.getIcon()) {
				// 			    r.write('&nbsp;&nbsp');
				// 			    }
				r.renderControl(o._getUpdatedTextControl());
			}
			r.write('</div>');
		}
	};
	return O;
}, true);