import LLMParams from './LLMParams';
import TemplateParams from './TemplateParams';
import {
    FakerParams, IntegerParams, BooleanParams,
    RegexParams, TimestampParams, DistributionParams, ForeignKeyParams
} from './StandardParams';

function ParamsManager({ type, params, onChange, context }) {
    switch (type) {
        case 'llm':
            return <LLMParams params={params} onChange={onChange} context={context} />;

        case 'template':
            return <TemplateParams params={params} onChange={onChange} context={context} />;

        case 'faker':
            return <FakerParams params={params} onChange={onChange} />;

        case 'integer':
            return <IntegerParams params={params} onChange={onChange} />;

        case 'boolean':
            return <BooleanParams params={params} onChange={onChange} />;

        case 'regex':
            return <RegexParams params={params} onChange={onChange} />;

        case 'timestamp':
            return <TimestampParams params={params} onChange={onChange} />;

        case 'distribution':
            return <DistributionParams params={params} onChange={onChange} />;

        case 'foreign_key':
            return <ForeignKeyParams params={params} onChange={onChange} context={context} />;

        default:
            return <div className="text-xs text-gray-500">No configuration needed for this type.</div>;
    }
}

export default ParamsManager;