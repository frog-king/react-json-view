import React from 'react';

//theme
import Theme from './../../themes/getStyle';

export default class extends React.PureComponent {
    render() {
        const { rjvId, type_name, displayDataTypes, theme, editModee } = this.props;
        if (editMode) {
            return (
                <span
                    class="data-type-label"
                    {...Theme(theme, 'data-type-label')}
                >
                    <select value={type_name}>
                        <option value="string">String</option>
                        <option value="boolean">Boolean</option>
                        <option value="integer">Integer</option>
                        <option value="float">Float</option>
                        <option value="date">Date</option>
                        <option value="array">Array</option>
                        <option value="object">Object</option>
                        <option value="regexp">Regexp</option>
                        <option value="null">Null</option>                  
                    </select>
                </span>
            );
        }
        return null;
    }
}
