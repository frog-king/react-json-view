import React from 'react';

//theme
import Theme from './../../themes/getStyle';

export default class extends React.PureComponent {
    render() {
        const { rjvId, type_name, displayDataTypes, theme } = this.props;
        if (displayDataTypes) {
            return (
                <span
                    class="data-type-label"
                    {...Theme(theme, 'data-type-label')}
                >
                    <select value={type_name}>
                        <option value="boolean">Boolean</option>
                        <option value="string">String</option>
                    </select>
                </span>
            );
        }
        return null;
    }
}
