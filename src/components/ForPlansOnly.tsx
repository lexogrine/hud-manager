import { ContextData } from "./Context";
import * as I from './../api/interfaces';

const Blocker = ({ children, plan }: {children: any, plan: string }) => (
    <div className="blocker">
        <div className="info">
            Upgrade your LHM to {plan.charAt(0).toUpperCase() + plan.substr(1)} Plan to get full access to this section.
            <a
                className="button green big wide strong"
                href={'https://lexogrine.com/manager/register'}
							rel={'noopener noreferrer'}
							target={'_blank'}
            >Upgrade now</a>
        </div>
        <div style={{ pointerEvents:'none' }}>{children}</div>
    </div>
)

export const ForPlansOnly = ({ required, children }: { children: any, required: I.LicenseType }) => (
	<ContextData.Consumer>
		{cxt => {
			if(required === 'free') return children;
            if(!cxt.customer || cxt.customer.license.type === 'free') return <Blocker plan={required}>{children}</Blocker>
            
            if(required === 'personal') {
                return children;
            }

            if(cxt.customer.license.type !== 'personal'){
                return children;
            }
            return <Blocker plan={required}>{children}</Blocker>;
		}}
	</ContextData.Consumer>
);

export default ForPlansOnly;