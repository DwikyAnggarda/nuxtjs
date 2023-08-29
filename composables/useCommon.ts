import { useRouter, useState } from '#app'
import useErrorMapper from './useErrorMapper'
import { ISession } from '~~/types/ISession'
import { IUser } from '~/types/IUser'
import $ from 'jquery';
import dt from 'datatables.net';

//let DataTable = dt(window, $)

$.fn.dataTable = dt;
//$.fn.dataTableSettings = dt.settings;
//$.fn.dataTableExt = dt.ext;

$.extend( true, $.fn.dataTable.defaults, {
    dom:
        "<'v-table__wrapper'tr>" +
        "<'v-row mb-5'<'v-col v-col-5'i><'v-col v-col-7 text-right'p>>",
    renderer: 'vuetify'
} );
/* Default class modification */
$.extend( $.fn.dataTableExt.classes, {
    sWrapper:      "dataTables_wrapper v-table v-theme--light v-table--density-compact",
    //sFilterInput:  "form-control form-control-sm",
    sLengthSelect: "custom-select custom-select-sm form-control form-control-sm",
    sProcessing:   "dataTables_processing card",
    sPaging: 'v-pagination v-theme--light dataTables_paginate paging_',
    sPageButton:   "v-pagination__item page-item",
    sPageButtonActive: 'pagination__item v-pagination__item--is-active pag_active'
} );
//self.addClass('table-bordered table-hover');
$.fn.dataTableExt.renderer.pageButton.vuetify = function ( settings, host, idx, buttons, page, pages ) {
    var api     = new dt.Api( settings );
    var classes = settings.oClasses;
    var lang    = settings.oLanguage.oPaginate;
    var aria = settings.oLanguage.oAria.paginate || {};
    var btnDisplay, btnClass, counter=0;

    var attach = function( container, buttons ) {
        var i, ien, node, button;
        var clickHandler = function ( e ) {
            e.preventDefault();
            if ( !$(e.currentTarget).hasClass('disabled') && api.page() != e.data.action ) {
                api.page( e.data.action ).draw( 'page' );
            }
        };

        for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
            button = buttons[i];
            var btnCls = page === button ? 'rounded':'';
            var btnStyle = page === button ? "background-color : #6E8A3D; color : white;" : "";
            if ( Array.isArray( button ) ) {
                attach( container, button );
            }
            else {
                btnDisplay = '';
                btnClass = '';

                switch ( button ) {
                    case 'ellipsis':
                        btnDisplay = '&#x2026;';
                        btnClass = 'disabled';
                        break;

                    case 'first':
                        btnDisplay = lang.sFirst;
                        btnClass = button + (page > 0 ?
                            '' : ' disabled');
                        break;

                    case 'previous':
                        btnDisplay = lang.sPrevious;
                        btnClass = button + (page > 0 ?
                            '' : ' disabled');
                        break;

                    case 'next':
                        btnDisplay = lang.sNext;
                        btnClass = button + (page < pages-1 ?
                            '' : ' disabled');
                        break;

                    case 'last':
                        btnDisplay = lang.sLast;
                        btnClass = button + (page < pages-1 ?
                            '' : ' disabled');
                        break;

                    default:
                        btnDisplay = button + 1;
                        btnClass = page === button ?
                            'v-pagination__item--is-active' : '';
                        break;
                }

                if ( btnDisplay ) {
                    node = $('<li>', {
                            'class': classes.sPageButton+' '+btnClass,
                            'id': idx === 0 && typeof button === 'string' ?
                                settings.sTableId +'_'+ button :
                                null
                        } )
                        .append( $('<button>', {
                                'aria-controls': settings.sTableId,
                                'aria-label': aria[ button ],
                                'data-dt-idx': counter,
                                'tabindex': settings.iTabIndex,
                                'style' : btnStyle,
                                'class': 'v-btn v-btn--size-small v-btn--icon v-theme--light '+btnCls+' v-btn--density-default  v-btn--variant-text'
                            } )
                            .html( '<span class="v-btn__overlay"></span><span class="v-v-btn__underlay"></span><span class="v-btn__content" data-no-activator="">'+btnDisplay+'</span>' )
                        )
                        .appendTo( container );

                    settings.oApi._fnBindAction(
                        node, {action: button}, clickHandler
                    );

                    counter++;
                }
            }
        }
    };

    // IE9 throws an 'unknown error' if document.activeElement is used
    // inside an iframe or frame. 
    var activeEl;

    try {
        // Because this approach is destroying and recreating the paging
        // elements, focus is lost on the select button which is bad for
        // accessibility. So we want to restore focus once the draw has
        // completed
        activeEl = $(host).find(document.activeElement).data('dt-idx');
    }
    catch (e) {}

    attach(
        $(host).empty().html('<ul class="v-pagination__list"/>').children('ul'),
        buttons
    );

    if ( activeEl !== undefined ) {
        $(host).find( '[data-dt-idx='+activeEl+']' ).trigger('focus');
    }
};

export function createTable (tableRef: any, options: any) {
    var tableEl = tableRef.value.$el.querySelector('table');
    console.log('tableEl', tableEl)
    var self = $(tableEl), pos = '';

    if (options.ajax) {
        if (typeof options.ajax == 'string') {
            var urlPath = options.ajax;
            options['ajax'] = async (data, callback, settings) => {
                console.log('data', data, settings)
                const params = {
                    draw: data.draw, 
                    length: data.length,
                    start: data.start,
                    search: data.search.value,
                    order_col: data.order[0].column,
                    order_dir: data.order[0].dir
                };
                if (options.paramData) {
                    options.paramData(params);
                }
                const queryString = new URLSearchParams(params).toString();
                console.log(queryString);
                let response = await authFetch(urlPath+'?'+queryString);
                if (response.ok) {
                    let msg = await response.json();
                    let recordsTotal = msg.total ? msg.total : 0;
                    let data = {
                        recordsTotal: recordsTotal,
                        recordsFiltered: recordsTotal,
                        draw: msg.draw,
                        data: msg.data ? msg.data : [],
                    };
                    callback(data);
                } else {
                    let data = {
                        recordsTotal: 0,
                        recordsFiltered: 0,
                        data: [],
                    };
                    callback(data);
                }
            }
        }
    }
    var params = $.extend({}, {
        serverSide: true,
        frame: false,
        columnId: 'id',
        roles: [],
        selectedRowClass: 'selected bg-success',
        rowClick: function() {},
        buttonClick: function() {},
        processing: true,
        language: {
            //processing: '<span class="v-btn__loader"><div class="v-progress-circular v-progress-circular--indeterminate v-progress-circular--visible v-theme--light" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width: 23px; height: 23px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43.80952380952381 43.80952380952381" style="transform: rotate(calc(-90deg));"><circle class="v-progress-circular__underlay" fill="transparent" cx="50%" cy="50%" r="20" stroke-width="3.8095238095238093" stroke-dasharray="125.66370614359172" stroke-dashoffset="0"></circle><circle class="v-progress-circular__overlay" fill="transparent" cx="50%" cy="50%" r="20" stroke-width="3.8095238095238093" stroke-dasharray="125.66370614359172" stroke-dashoffset="125.66370614359172px"></circle></svg><!----></div></span>',
            "decimal": "",
            "emptyTable": "Tidak ada data",
            "info": "_START_ - _END_ dari _TOTAL_ data",
            "infoEmpty": "0 - 0 dari 0 data",
            "infoFiltered": "(filter dari _MAX_ total data)",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "_MENU_ baris",
            "loadingRecords": "Loading...",
            "processing": "<div class='bg-warning pa-3'><span><div class='v-progress-circular v-progress-circular--indeterminate v-progress-circular--visible v-theme--light' role='progressbar' aria-valuemin='0' aria-valuemax='100' style='width: 23px; height: 23px;'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 43.80952380952381 43.80952380952381' style='transform: rotate(calc(-90deg));'><circle class='v-progress-circular__underlay' fill='transparent' cx='50%' cy='50%' r='20' stroke-width='3.8095238095238093' stroke-dasharray='125.66370614359172' stroke-dashoffset='0'></circle><circle class='v-progress-circular__overlay' fill='transparent' cx='50%' cy='50%' r='20' stroke-width='3.8095238095238093' stroke-dasharray='125.66370614359172' stroke-dashoffset='125.66370614359172px'></circle></svg><!----></div></span><p>Sedang Proses... </p></div>",
            "search": "Cari:",
            "zeroRecords": "Data tidak ditemukan",
            "paginate": {
                "first": "<<",
                "last": ">>",
                "next": ">",
                "previous": "<"
            }
        }
    }, options);
    // if (params.frame) {
    //     //box_container+=' box-solid';
    //     self.wrap('<div class="card box-table" id="' + id + '_area" />'); //<h2 class="'+Config.dtClass.title+'">'+title+'</h2>
    //     self.before('<div class="card-header" id="' + id + '_caption"><h3 class="card-title">' + params.title + '</h3><div class="box-tools card-tools toolbar"></div>');
    //     self.wrap('<div class="card-body" id="' + id + '_box" />');
    // }
    // const rolesButton = params.roles.map((key) => (
    //     '<button type="button" data-action="' + key + '" class="btn btn-tool" title="' + DataView.defaultButton[key].title + '"><i class="fas ' + DataView.defaultButton[key].icon + '"></i>'
    //     //var attr = DataView.defaultButton[key];
    // ));

    //self.closest('.box-table').find('.toolbar').html(rolesButton);
    //var controls = $('.toolbar button', self.closest('.box-table'));
    //if (params.toolbarEl) controls = $('button', params.toolbarEl);
    var oTable = $(tableEl).dataTable(params);
    var table = oTable.api();
    $('tbody', self).on('click', 'tr', function(event) {
        var pos = table.row(this).index();
        $(this).siblings().each(function() { $(this).removeClass(params.selectedRowClass); });
        $(this).addClass(params.selectedRowClass);
        var data = table.row(this).data();
        params.rowClick({ row: this, data: data });
    });
    self.destroy = function() {
        table.destroy();
        if (params.frame) $(self).closest('.card').remove();
    };
    self.toolbarClick = function(evt) {
        var row = table.rows('.selected').data();
        var rowData = row.length > 0 ? row[0] : null;
        var role = $(evt.currentTarget).data('action');
        if (role == 'read') {
            table.api().ajax.reload();
        }
        params.buttonClick({ id: rowData ? rowData[params.columnId] : null, data: rowData, role: role })
    }

    //controls.click(self.toolbarClick);
    return table;
}
