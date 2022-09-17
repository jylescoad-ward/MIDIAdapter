<template>
    <b-card header="OBS Output Event">
        <b-form-group label="Event" label-cols="4" label-cols-lg="3" label-cols-xl="2">
            <select class="form-control" id="OBSOutputEventAction" v-model="selectedItem">
                <option value="null" default disabled selected>None</option>
                <optgroup label="Scene">
                    <option value="SetCurrentScene">Switch to Scene</option>
                    <option value="SetPreviewScene">Preview Scene</option>
                    <option value="TransitionToProgram">Transition Preview to Main</option>
                </optgroup>
                <optgroup label="Source">
                    <option value="SetSourceVisibility=false">Hide Source</option>
                    <option value="SetSourceVisibility=true">Show Source</option>
                    <option value="SetSourceVisibility=toggle">Toggle Source</option>
                </optgroup>
                <optgroup label="Audio">
                    <option value="SetMute=true">Mute</option>
                    <option value="SetMute=false">Un-mute</option>
                    <option value="ToggleMute">Toggle Mute</option>
                </optgroup>
                <optgroup label="Recording">
                    <option value="StartRecording">Start Recording</option>
                    <option value="StopRecording">Stop Recording</option>
                    <option value="PauseRecording">Pause Recording</option>
                    <option value="ResumeRecording">Resume Recording</option>
                </optgroup>
                <optgroup label="Streaming">
                    <option value="StartStreaming">Start Streaming</option>
                    <option value="StopStreaming">Stop Streaming</option>
                    <option value="PauseStreaming">Pause Streaming</option>
                    <option value="ResumeStreaming">Resume Streaming</option>
                </optgroup>
            </select>
        </b-form-group>
        <b-form-group label="Object" label-cols="4" label-cols-lg="3" label-cols-xl="2">
            <select action="OBSOutputEventObject" id="OBSOutputEventObject" class="form-control" v-model="selectedData">
                <template v-if="selectedItem.toString() == 'TransitionToProgram'">
                    <option default selected disabled>Transition</option>
                    <template v-for="(item, index) in $appData.Adapter.OBSManager.Cache.Transitions">
                        <option v-bind:key="`obs-output-transition-${item.name}-${index}`" v-bind:value="item.name">{{item.name}}</option>
                    </template>
                </template>
                <template v-else-if="selectedItem.toString().includes('Scene')">
                    <option default selected disabled>Scene</option>
                    <template v-for="(item, index) in $appData.Adapter.OBSManager.Cache.Scenes">
                        <option v-bind:key="`obs-output-scene-${item.name}-${index}`" v-bind:value="item.name">{{item.name}}</option>
                    </template>
                </template>
                <template v-else-if="selectedItem.toString().includes('Source') || selectedItem.toString().includes('Mute')">
                    <option default selected disabled>Source</option>
                    <template v-for="(item, index) in $appData.Adapter.OBSManager.Cache.Sources">
                        <option v-bind:key="`obs-output-source-${item.name}-${index}`" v-bind:value="item.name">{{item.name}}</option>
                    </template>
                </template>
                <template v-else>
                    <option default disabled selected>None</option>
                </template>
            </select>
        </b-form-group>
        <b-form-group label="Data" label-cols="4" label-cols-lg="3" label-cols-xl="2">
            <select action="OBSOutputEventData" id="OBSOutputEventData" class="form-control" v-model="selectedOtherData">
                <option default disabled selected>None</option>
            </select>
        </b-form-group>
    </b-card>
</template>
<script>
export default {
    name: 'OBSOutputEventCard',
    data () {
        return {
            selectedItem: '',
            selectedData: '',
            selectedOtherData: '',
            updateInterval: null
        }
    },
    methods: {
        toObject() {
            return {
                event: this.$data.selectedItem,
                data: this.$data.selectedData
            }
        },
        fromObject(data) {
            this.$set(this.$data, 'selectedItem', data.event)
            this.$set(this.$data, 'selectedData', data.data)
        }
    }
}
</script>