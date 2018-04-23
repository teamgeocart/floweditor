import * as React from 'react';
import { ConfigProviderContext, endpointsPT } from '../../../config';
import { Types } from '../../../config/typeConfigs';
import {
    AttributeType,
    SetContactAttribute,
    SetContactField,
    SetContactProperty
} from '../../../flowTypes';
import { SearchResult } from '../../../store';
import ConnectedAttribElement from '../../form/AttribElement';
import ConnectedTextInputElement from '../../form/TextInputElement';
import {
    fieldToSearchResult,
    newFieldAction,
    newPropertyAction,
    propertyToSearchResult
} from './helpers';

export interface SetContactAttribFormProps {
    action: SetContactAttribute;
    onBindWidget: (ref: any) => void;
    updateAction: (action: SetContactAttribute) => void;
    addContactField: (name: string) => void;
}

export const ATTRIB_HELP_TEXT =
    'Select an existing attribute to update or type any name to create a new one';
export const TEXT_INPUT_HELP_TEXT =
    'The value to store can be any text you like. You can also reference other values that have been collected up to this point by typing @run.results or @webhook.json.';

export default class SetContactAttribForm extends React.Component<SetContactAttribFormProps> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: SetContactAttribFormProps, context: ConfigProviderContext) {
        super(props);
        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        const { wrappedInstance: { state: { attribute } } } = widgets.Attribute;
        const { wrappedInstance: { state: { value } } } = widgets.Value;

        if (attribute.type === AttributeType.field) {
            // include our contact field in our local storage
            this.props.addContactField(attribute.name);
            this.props.updateAction(newFieldAction(this.props.action.uuid, value, attribute.name));
        } else {
            this.props.updateAction(
                newPropertyAction(this.props.action.uuid, value, attribute.name)
            );
        }
    }

    private getInitial(): SearchResult {
        if (this.props.action.type === Types.set_contact_field) {
            return fieldToSearchResult(this.props.action as SetContactField);
        } else {
            return propertyToSearchResult(this.props.action as SetContactProperty);
        }
    }

    public render(): JSX.Element {
        const initial = this.getInitial();
        return (
            <>
                <ConnectedAttribElement
                    ref={this.props.onBindWidget}
                    name="Attribute"
                    showLabel={true}
                    endpoint={this.context.endpoints.fields}
                    helpText={ATTRIB_HELP_TEXT}
                    initial={initial}
                    add={true}
                    required={true}
                />
                <ConnectedTextInputElement
                    ref={this.props.onBindWidget}
                    name="Value"
                    showLabel={true}
                    value={this.props.action.value}
                    helpText={TEXT_INPUT_HELP_TEXT}
                    autocomplete={true}
                />
            </>
        );
    }
}