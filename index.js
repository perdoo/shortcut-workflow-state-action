const core = require('@actions/core');
const Clubhouse = require('clubhouse-lib');

async function run() {
    try {
        const token = core.getInput('token');
        const client = Clubhouse.create(token);
        const fromStateId = core.getInput('fromStateId');
        const toStateId = core.getInput('toStateId');

        const processResult = result => {
            if (!result.total) {
                core.info('No stories found in the given workflow state.');
                return;
            }

            for ({ id } of result.data) {
                client.updateStory(id, { 'workflow_state_id': toStateId });
            }

            if (!result.fetchNext) {
                console.log(`Moved ${result.total} stories.`);
                return;
            }

            result.fetchNext()
                .then(processResult);
        };

        client.searchStories(`state:${fromStateId}`)
            .then(processResult);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();