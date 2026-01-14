import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class HeaderBarService { 

    boostrapIconNamesList = ['person', 'person-circle',
        'person-gear', 'person-vcard', 'people', 'gear', 'key', 'list', 'grid', 'house',
        'compass', 'bell', 'chat', 'chat-dots', 'envelope', 'megaphone', 'heart', 'hand-thumbs-up', 
        'share', 'bookmark', 'search', 'filter', 'funnel', 'sliders', 'pencil', 'trash', 
        'arrow-repeat', 'arrow-clockwise', 'download', 'upload', 'moon', 'sun', 'circle-half',
        'palette', 'globe', 'flag', 'translate', 'lock', 'unlock', 'shield','shield-lock', 'cart',
        'bag', 'calendar', 'clock', 'info-circle', 'question-circle', 'award', 'trophy', 'star', 'patch-check',
        'graph-up', 'bar-chart', 'speedometer', 'activity', 'clock-history', 'chat-left-text', 'chat-heart',
        'inbox', 'reply', 'send', 'tools', 'wrench', 'layout-text-window', 'life-preserver', 'card-image',
        'database', 'cloud', 'film', 'rocket-takeoff', 'fork-knife', 'suitcase', 'globe-americas', 'geo'
    ];


}
