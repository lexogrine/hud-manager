//import TeamEditModal from './TeamEditModal';
import * as I from './../../../../api/interfaces';
import { useState } from 'react';
import Swiss from './Brackets/Swiss';
import { IContextData } from '../../../Context';

interface IProps {
    tournament: I.Tournament;
	close: () => void;
    cxt: IContextData;
}

type Tabs = 'overview' | 'group' | 'playoffs' | 'matches'

const Tab = ({ tab, active, setTab }: { tab: Tabs, active: Tabs, setTab: (tab: Tabs) => void}) => (
    <div className={`${tab} ${tab === active ? 'active':''}`} onClick={() => setTab(tab)}>
        {tab}
    </div>
)

const Tournament = ({ tournament, cxt }: IProps) => {
    const [ tab, setTab ] = useState<Tabs>('overview');
    

    const group = tournament.groups[0];
    return (
        <>
            <div className="tab-content-container no-padding">
                <div className="tournament-info-header">
                    <div className="tournament-logo">

                    </div>
                    <div className="tournament-details">
                        {tournament.name}
                        <div className="tabs">
                            <Tab tab="overview" active={tab} setTab={setTab} />
                            <Tab tab="group" active={tab} setTab={setTab} />
                            <Tab tab="playoffs" active={tab} setTab={setTab} />
                            <Tab tab="matches" active={tab} setTab={setTab} />
                        </div>
                    </div>
                </div>
                <div className="tournament-content">
                    { group ? <Swiss cxt={cxt} tournament={tournament} stage={group}  /> : null}
                </div>
            </div>
        </>
    );
};

export default Tournament;
