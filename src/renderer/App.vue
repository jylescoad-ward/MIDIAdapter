<template>
    <div id="app">
        <!-- <router-view></router-view> -->
        <!-- <OBSOutputEventCard /> -->
        <b-button @click="$refs.settingsModal.show()">Settings</b-button>
        <b-button @click="connect" v-bind:disabled="connectButtonDisable">Connect</b-button>
        <b-button @click="disconnect" v-bind:disabled="disconnectButtonDisable">Disconnect</b-button>
        <EventEditModal ref="eventEditModal" @save="onModalSave" @discard="onModalDiscard" />
        <SettingsModal ref="settingsModal" />
        <b-col>
            <b-row>
                <b-col>Name</b-col>
                <b-col cols="auto">
                    <b-button @click="createEvent"><b-icon icon="plus"></b-icon></b-button>
                </b-col>
            </b-row>
            <template v-for="(item, index) in $appData.Adapter.EventCoordinator.Events.cache">
                <b-row v-bind:key="`coordinator-event-${item[1].id}-${index}`">
                    <b-col>{{item[1].label}}</b-col>
                    <b-col cols="auto">
                        <b-button-group>
                            <b-button variant="secondary" size="sm" @click="editEvent(item[1], index)"><b-icon icon="pencil"></b-icon></b-button>
                            <b-button variant="danger" size="sm" @click="removeEvent(item[1])"> <b-icon icon="trash"></b-icon> </b-button>
                        </b-button-group>
                    </b-col>
                </b-row>
            </template>
        </b-col>
    </div>
</template>

<script>
import EventEditModal from './components/EventEditModal.vue'
import OBSOutputEventCard from './components/OBSOutputEventCard.vue'
import SettingsModal from './components/SettingsModal.vue'
export default {
    components: { OBSOutputEventCard, EventEditModal, SettingsModal },
    name: 'midiadapter',
    computed: {
        appData () {
            return global.AppData
        }
    },
    data () {
        return {
            selectedId: null,
            disconnectButtonDisable: true,
            connectButtonDisable: false
        }
    },
    methods: {
        async connect () {
            this.$set(this.$data, 'connectButtonDisable', true)
            this.$set(this.$data, 'disconnectButtonDisable', true)
            try {
                await AppData.Adapter.OBSManager.Connect()
            } catch (err) {
                alert(`Failed to connect to OBS\n${err}`)
                this.$set(this.$data, 'connectButtonDisable', false)
                this.$set(this.$data, 'disconnectButtonDisable', true)
                return
            }
            this.$set(this.$data, 'connectButtonDisable', true)
            this.$set(this.$data, 'disconnectButtonDisable', false)
        },
        async disconnect () {
            this.$set(this.$data, 'connectButtonDisable', true)
            this.$set(this.$data, 'disconnectButtonDisable', true)
            try {
                await AppData.Adapter.OBSManager.Disconnect()
            } catch (err) {
                alert(`Failed to disconnect\n${err}`)
                this.$set(this.$data, 'connectButtonDisable', true)
                this.$set(this.$data, 'disconnectButtonDisable', false)
                return
            }
            this.$set(this.$data, 'connectButtonDisable', false)
            this.$set(this.$data, 'disconnectButtonDisable', true)
        },
        editEvent (item, index) {
            console.log(item)
            this.$set(this.$data, 'selectedId', item.id)
            this.$refs.eventEditModal.setData(item.toJSON())
            this.$refs.eventEditModal.show()
        },
        createEvent () {
            AppData.Adapter.EventCoordinator.CreateEvent('Blank')
            this.$forceUpdate()
        },
        removeEvent (item) {
            this.$appData.Adapter.EventCoordinator.RemoveEvent(item.id)
            this.$forceUpdate()
        },
        onModalSave (data) {
            console.log(data)
            AppData.Adapter.EventCoordinator.Events.cache.get(this.selectedItemJSON.id).fromJSON(data)
            this.$forceUpdate()
        },
        onModalDiscard () {

        }
    },
    computed: {
        selectedItem () {
            if (this.$data.selectedId == null) return null
            return AppData.Adapter.EventCoordinator.Events.cache.get(this.$data.selectedId)
        },
        selectedItemJSON () {
            if (this.$data.selectedId == null) return null
            return AppData.Adapter.EventCoordinator.Events.cache.get(this.$data.selectedId).toJSON()
        }
    }
}
</script>
<style>
.row {
    border-bottom: 1px solid var(--gray);
    padding-top: 0.3rem;
    padding-bottom: 0.3rem;
    vertical-align: middle;
    line-height: 1rem;
}
</style>
