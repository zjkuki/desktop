import {
    Component,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';

import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { PolicyService } from 'jslib/abstractions/policy.service';
import { SearchService } from 'jslib/abstractions/search.service';
import { SendService } from 'jslib/abstractions/send.service';
import { UserService } from 'jslib/abstractions/user.service';

import { SendComponent as BaseSendComponent } from 'jslib/angular/components/send/send.component';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { SendView } from 'jslib/models/view/sendView';

import { AddEditComponent } from './add-edit.component';

enum Action {
    None = '',
    Add = 'add',
    Edit = 'edit',
}

const BroadcasterSubscriptionId = 'SendComponent';

@Component({
    selector: 'app-send',
    templateUrl: 'send.component.html',
})
export class SendComponent extends BaseSendComponent implements OnInit, OnDestroy {
    @ViewChild(AddEditComponent) addEditComponent: AddEditComponent;

    sendId: string;
    action: Action = Action.None;

    constructor(sendService: SendService, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, environmentService: EnvironmentService,
        private broadcasterService: BroadcasterService, ngZone: NgZone,
        searchService: SearchService, policyService: PolicyService,
        userService: UserService) {
        super(sendService, i18nService, platformUtilsService,
              environmentService, ngZone, searchService,
              policyService, userService);
    }

    async ngOnInit() {
        super.ngOnInit();
        this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
            this.ngZone.run(async () => {
                switch (message.command) {
                    case 'syncCompleted':
                        if (message.successfully) {
                            await this.load();
                        }
                        break;
                    case 'syncCompleted':
                        await this.load();
                        break;
                }
            });
        });
        await this.load();
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    addSend() {
        this.action = Action.Add;
        if (this.addEditComponent != null) {
            this.addEditComponent.sendId = null;
            this.addEditComponent.send = null;
            this.addEditComponent.load();
        }
    }

    editSend(send: SendView) {
        return;
    }

    cancel(s: SendView) {
        this.action = Action.None;
        this.sendId = null;
    }

    async selectSend(sendId: string) {
        if (sendId === this.sendId) {
            return;
        }
        this.action = Action.Edit;
        this.sendId = sendId;
        if (this.addEditComponent != null) {
            this.addEditComponent.sendId = sendId;
            await this.addEditComponent.refresh();
        }
    }

    get selectedSendType() {
        return this.sends.find(s => s.id === this.sendId)?.type;
    }
}
