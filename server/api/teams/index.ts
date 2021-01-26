import db from './../../../init/database';
import { Team, CustomFieldEntry, CustomFieldStore } from '../../../types/interfaces';

const { teams, custom } = db;

export async function getTeamById(id: string, logo = false): Promise<Team | null> {
	return new Promise(res => {
		teams.findOne({ _id: id }, (err, team) => {
			if (err) {
				return res(null);
			}
			if (!logo && team && team.logo) delete team.logo;
			return res(team);
		});
	});
}

export const getTeamsList = (query: any) =>
	new Promise<Team[]>(res => {
		teams.find(query, (err, teams) => {
			if (err) {
				return res([]);
			}
			return res(teams);
		});
    });
    
export const initiateCustomFields = () => new Promise<CustomFieldStore>((res) => {
    custom.findOne({}, (err, store) => {
        if(store){
            return res(store);
        }
        const customFields = { players: [], teams: [] }
        custom.insert(customFields, (err, entry) => {
            return res(entry);
        });
    });
});

export const getTeamFields = async () =>  {
    const store = await initiateCustomFields();
    if(!store) return [];
    return store.teams;
};

export const updateTeamFields = async (teamFields: CustomFieldEntry[]) => {
    const store = await initiateCustomFields();

    const deletedFields = store.teams.filter(field => !teamFields.find(newField => newField.name === field.name));
    const createdFields = teamFields.filter(newField => !store.teams.find(field => field.name === newField.name));

    if(!deletedFields.length && !createdFields.length) {
        return store;
    }
    return new Promise<CustomFieldStore>((res) => {
        custom.update({}, { $set: { teams: teamFields } }, { multi: true }, () => {
            const updateQuery = {
                $unset: {},
                $set: {}
            }
            for(const deletedField of deletedFields){
                updateQuery.$unset[`extra.${deletedField.name}`] = true;
            }
            for(const createdField of createdFields){
                updateQuery.$set[`extra.${createdField.name}`] = '';
            }
            teams.update({}, updateQuery, { multi: true }, async () => {
                res(await initiateCustomFields());
            });
        });
    });
};