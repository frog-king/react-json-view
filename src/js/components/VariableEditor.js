import React from 'react';
import Select from 'react-select';
import AutosizeTextarea from 'react-textarea-autosize';
import { ToastContainer, toast } from 'react-toastify';

import { toType } from './../helpers/util';
import dispatcher from './../helpers/dispatcher';
import parseInput from './../helpers/parseInput';
import stringifyVariable from './../helpers/stringifyVariable';
import CopyToClipboard from './CopyToClipboard';

//data type components
import {
    JsonBoolean,
    JsonDate,
    JsonFloat,
    JsonFunction,
    JsonInteger,
    JsonNan,
    JsonNull,
    JsonRegexp,
    JsonString,
    JsonUndefined
} from './DataTypes/DataTypes';

//clibboard icon
import { Edit, CheckCircle, RemoveCircle as Remove } from './icons';

//theme
import Theme from './../themes/getStyle';

const Types = [
    { value: "string", label: "String" },
    { value: "boolean", label: "Boolean" },
    { value: "integer", label: "Integer" },
    { value: "float", label: "Float" },
    { value: "date", label: "Date" },
    { value: "array", label: "Array" },
    { value: "object", label: "Object" },
    { value: "regexp", label: "Regexp" },
    { value: "null", label: "Null" },
]

const TrueFalse = [
    { value: true, label: "True" },
    { value: false, label: "False"},
]

class VariableEditor extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false,
            editValue: '',
            hovered: false,
            renameKey: false,
            inputType: props.variable.type || '',
            parsedInput: {
                type: false,
                value: null
            }
        };
    }

    render() {
        const {
            variable,
            singleIndent,
            type,
            theme,
            namespace,
            indentWidth,
            enableClipboard,
            onEdit,
            onDelete,
            onSelect,
            displayArrayKey,
            quotesOnKeys
        } = this.props;
        const { editMode } = this.state;

        return (
            <div
                {...Theme(theme, 'objectKeyVal', {
                    paddingLeft: indentWidth * singleIndent
                })}
                onMouseEnter={() =>
                    this.setState({ ...this.state, hovered: true })
                }
                onMouseLeave={() =>
                    this.setState({ ...this.state, hovered: false })
                }
                class="variable-row"
                key={variable.name}
            >
                {type == 'array' ? (
                    displayArrayKey ? (
                        <span
                            {...Theme(theme, 'array-key')}
                            key={variable.name + '_' + namespace}
                        >
                            {variable.name}
                            <div {...Theme(theme, 'colon')}>:</div>
                        </span>
                    ) : null
                ) : (
                    <span>
                        <span
                            {...Theme(theme, 'object-name')}
                            class="object-key"
                            key={variable.name + '_' + namespace}
                        >
                            {!!quotesOnKeys && (
                                <span style={{ verticalAlign: 'top' }}>"</span>
                            )}
                            <span style={{ display: 'inline-block' }}>
                                {variable.name}
                            </span>
                            {!!quotesOnKeys && (
                                <span style={{ verticalAlign: 'top' }}>"</span>
                            )}
                        </span>
                        <span {...Theme(theme, 'colon')}>:</span>
                    </span>
                )}
                <div
                    class="variable-value"
                    onClick={
                        onSelect === false && onEdit === false
                            ? null
                            : e => {
                                  let location = [...namespace];
                                  if (
                                      (e.ctrlKey || e.metaKey) &&
                                      onEdit !== false
                                  ) {
                                      this.prepopInput(variable);
                                  } else if (onSelect !== false) {
                                      location.shift();
                                      onSelect({
                                          ...variable,
                                          namespace: location
                                      });
                                  }
                              }
                    }
                    {...Theme(theme, 'variableValue', {
                        cursor: onSelect === false ? 'default' : 'pointer'
                    })}
                >
                    {this.getValue(variable, editMode)}
                </div>
                {enableClipboard ? (
                    <CopyToClipboard
                        rowHovered={this.state.hovered}
                        hidden={editMode}
                        src={variable.value}
                        clickCallback={enableClipboard}
                        {...{ theme, namespace: [...namespace, variable.name] }}
                    />
                ) : null}
                {onEdit !== false && editMode == false
                    ? this.getEditIcon()
                    : null}
                {onDelete !== false && editMode == false
                    ? this.getRemoveIcon()
                    : null}
            </div>
        );
    }

    getEditIcon = () => {
        const { variable, theme } = this.props;

        return (
            <div
                class="click-to-edit"
                style={{
                    verticalAlign: 'top',
                    display: this.state.hovered ? 'inline-block' : 'none'
                }}
            >
                <Edit
                    class="click-to-edit-icon"
                    {...Theme(theme, 'editVarIcon')}
                    onClick={() => {
                        this.prepopInput(variable);
                    }}
                />
            </div>
        );
    };

    prepopInput = variable => {
        if (this.props.onEdit !== false) {
            const stringifiedValue = stringifyVariable(variable.value);
            const detected = parseInput(stringifiedValue);
            console.debug('PREPOP', detected);
            console.debug(stringifiedValue);
            this.setState({
                editMode: true,
                editValue: stringifiedValue,
                parsedInput: {
                    type: detected.type,
                    value: detected.value
                }
            });
        }
    };

    getRemoveIcon = () => {
        const { variable, namespace, theme, rjvId } = this.props;

        return (
            <div
                class="click-to-remove"
                style={{
                    verticalAlign: 'top',
                    display: this.state.hovered ? 'inline-block' : 'none'
                }}
            >
                <Remove
                    class="click-to-remove-icon"
                    {...Theme(theme, 'removeVarIcon')}
                    onClick={() => {
                        dispatcher.dispatch({
                            name: 'VARIABLE_REMOVED',
                            rjvId: rjvId,
                            data: {
                                name: variable.name,
                                namespace: namespace,
                                existing_value: variable.value,
                                variable_removed: true
                            }
                        });
                    }}
                />
            </div>
        );
    };

    getValue = (variable, editMode) => {
        const type = editMode ? false : variable.type;
        const { props } = this;
        switch (type) {
            case false:
                return this.getEditInput();
            case 'string':
                return <JsonString value={variable.value} {...props} />;
            case 'integer':
                return <JsonInteger value={variable.value} {...props} />;
            case 'float':
                return <JsonFloat value={variable.value} {...props} />;
            case 'boolean':
                return <JsonBoolean value={variable.value} {...props} />;
            case 'function':
                return <JsonFunction value={variable.value} {...props} />;
            case 'null':
                return <JsonNull {...props} />;
            case 'nan':
                return <JsonNan {...props} />;
            case 'undefined':
                return <JsonUndefined {...props} />;
            case 'date':
                return <JsonDate value={variable.value} {...props} />;
            case 'regexp':
                return <JsonRegexp value={variable.value} {...props} />;
            default:
                // catch-all for types that weren't anticipated
                return (
                    <div class="object-value">
                        {JSON.stringify(variable.value)}
                    </div>
                );
        }
    };

    handleChange = (type) => {  
        this.setState({inputType: type.value});
    };

    changeBool = (type) => {
        this.setState({editValue: type.value});
    };

    getEditInput = () => {
        const { variable, theme } = this.props;
        const { editValue, parsedInput, inputType } = this.state;
        console.debug('variable', variable);
        console.debug('editValue', editValue);
        console.debug('type', typeof(editValue));
        console.debug('parsedInput', parsedInput);
        console.debug('input type', inputType);

        return (
            <div>
                {inputType === 'boolean' && 
                <Select
                    onChange={this.changeBool}
                    blurInputOnSelect
                    options={TrueFalse}
                    name="Bools"
                    defaultValue={({ label: variable.value, value: variable.value })}
                />}
                {inputType !== 'boolean' && 
                <AutosizeTextarea
                    type="text"
                    ref={input => input && input.focus()}
                    value={editValue}
                    class="variable-editor"
                    onChange={event => {
                        const value = event.target.value;
                        const detected = parseInput(value);
                        this.setState({
                            editValue: value,
                            parsedInput: {
                                type: detected.type,
                                value: detected.value
                            }
                        });
                    }}
                    onKeyDown={e => {
                        switch (e.key) {
                            case 'Escape': {
                                this.setState({
                                    editMode: false,
                                    editValue: ''
                                });
                                break;
                            }
                            case 'Enter': {
                                if (e.ctrlKey || e.metaKey) {
                                    this.submitEdit(true);
                                }
                                break;
                            }
                        }
                        e.stopPropagation();
                    }}
                    placeholder="update this value"
                    minRows={2}
                    {...Theme(theme, 'edit-input')}
                />}
                <Select
                    onChange={this.handleChange}
                    blurInputOnSelect
                    options={Types}
                    name="Types"
                    defaultValue={({ label: variable.type, value: variable.type })}
                />
                {/* <div>{this.showDetected()}</div> */}
                <div {...Theme(theme, 'edit-icon-container')}> 
                    Cancel
                    <Remove
                        class="edit-cancel"
                        {...Theme(theme, 'cancel-icon')}
                        onClick={() => {
                            this.setState({ editMode: false, editValue: '' });
                        }}
                    />{'  '}
                    Accept
                    <CheckCircle
                        class="edit-check string-value"
                        {...Theme(theme, 'check-icon')}
                        onClick={() => {
                            this.submitEdit();
                        }}
                    />
                    <ToastContainer />
                </div>
            </div>
        );
    };

    submitEdit = submit_detected => {

        const isValid = this.validateInput();
        const { variable, namespace, rjvId } = this.props;
        const { editValue, parsedInput, inputType } = this.state;
        console.debug('type off edit ', typeof(editValue));
        console.debug('edit going in', editValue);
        if (isValid) {
            let new_value = editValue;
            if (inputType === 'boolean') {
                console.debug('going to boolean', editValue, !!editValue, new Boolean(editValue));
                let bc = new Boolean("false");
                let bb = new Boolean(editValue);
                let bd = editValue === 'true';
                console.debug('bools are', bc, bb, bd);
                new_value = bd;
            }else if (parsedInput.type && inputType !== 'string') {
                console.debug('setting to parsed');
                new_value = parsedInput.value;
            }
            

            console.debug('NEW VALUE IS... ', new_value, ' of type ', parsedInput.type);
            console.debug('type off ', typeof(new_value));
            this.setState({
                editMode: false
            });
            dispatcher.dispatch({
                name: 'VARIABLE_UPDATED',
                rjvId: rjvId,
                data: {
                    name: variable.name,
                    namespace: namespace,
                    existing_value: variable.value,
                    new_value: new_value,
                    variable_removed: false
                }
            });
        } else {
            toast.error("Error adding variable.  Type not identified.", {
                position: "top-center",
                autoClose: 5000,
            });
        }
    };

    validateInput = () => {
        const { editValue, parsedInput, inputType } = this.state;
        console.debug('Type Chosen is ', inputType);
        const detected = parseInput(stringifyVariable(editValue));
        console.debug('DETECTED', detected);

        switch (inputType.toLowerCase()) {
            case 'object':
                return false;
            case 'array':
                return false;
            case 'string':
                return true;
            case 'integer':
                if (!isNaN(detected?.value)) {
                    return true;
                }
            case 'float':
                if (!isNaN(editValue)) {
                    return true;
                }
            case 'boolean':
                return true;
            case 'function':
                return false;
            case 'null':
                return false;
            case 'date':
                return false;
        }
        return false;
    };

    showDetected = () => {
        const { theme, variable, namespace, rjvId } = this.props;
        const { type, value } = this.state.parsedInput;
        const detected = this.getDetectedInput();
        if (detected) {
            return (
                <div>
                    <div {...Theme(theme, 'detected-row')}>
                        {detected}
                        <CheckCircle
                            class="edit-check detected"
                            style={{
                                verticalAlign: 'top',
                                paddingLeft: '3px',
                                ...Theme(theme, 'check-icon').style
                            }}
                            onClick={() => {
                                this.submitEdit(true);
                            }}
                        />
                    </div>
                </div>
            );
        }
    };

    getDetectedInput = () => {
        const { parsedInput } = this.state;
        const { type, value } = parsedInput;
        const { props } = this;
        const { theme } = props;

        if (type !== false) {
            switch (type.toLowerCase()) {
                case 'object':
                    return (
                        <span>
                            <span
                                style={{
                                    ...Theme(theme, 'brace').style,
                                    cursor: 'default'
                                }}
                            >
                                {'{'}
                            </span>
                            <span
                                style={{
                                    ...Theme(theme, 'ellipsis').style,
                                    cursor: 'default'
                                }}
                            >
                                ...
                            </span>
                            <span
                                style={{
                                    ...Theme(theme, 'brace').style,
                                    cursor: 'default'
                                }}
                            >
                                {'}'}
                            </span>
                        </span>
                    );
                case 'array':
                    return (
                        <span>
                            <span
                                style={{
                                    ...Theme(theme, 'brace').style,
                                    cursor: 'default'
                                }}
                            >
                                {'['}
                            </span>
                            <span
                                style={{
                                    ...Theme(theme, 'ellipsis').style,
                                    cursor: 'default'
                                }}
                            >
                                ...
                            </span>
                            <span
                                style={{
                                    ...Theme(theme, 'brace').style,
                                    cursor: 'default'
                                }}
                            >
                                {']'}
                            </span>
                        </span>
                    );
                case 'string':
                    return <JsonString value={value} {...props} />;
                case 'integer':
                    return <JsonInteger value={value} {...props} />;
                case 'float':
                    return <JsonFloat value={value} {...props} />;
                case 'boolean':
                    return <JsonBoolean value={value} {...props} />;
                case 'function':
                    return <JsonFunction value={value} {...props} />;
                case 'null':
                    return <JsonNull {...props} />;
                case 'nan':
                    return <JsonNan {...props} />;
                case 'undefined':
                    return <JsonUndefined {...props} />;
                case 'date':
                    return <JsonDate value={new Date(value)} {...props} />;
            }
        }
    };
}

//export component
export default VariableEditor;
