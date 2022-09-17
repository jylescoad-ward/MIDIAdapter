<template>
    <b-card header="MIDI Event">
        <div class="mb-3">
            {{inputDevices}}{{outputDevices}}
            <b-form-group label="Controler" label-cols="4" label-cols-lg="3" label-cols-xl="2">
                <template v-if="targetType == 'in'">
                    <b-select v-bind:options="inputDevices" v-model="controller" />
                </template>
                <template v-else-if="targetType == 'out'">
                    <b-select v-bind:options="outputDevices" v-model="controller" />
                </template>
            </b-form-group>
            <b-form-group label="Note" label-cols="4" label-cols-lg="3" label-cols-xl="2">
                <b-form-checkbox v-model="ignoreNote">Ignore</b-form-checkbox>
                <b-form-input type="number" min="0" max="127" v-model="note" v-bind:disabled="ignoreNote"/>
            </b-form-group>
            <b-form-group label="Velocity" label-cols="4" label-cols-lg="3" label-cols-xl="2">
                <b-form-checkbox v-model="ignoreVelocity">Ignore</b-form-checkbox>
                <b-form-input type="number" min="0" max="127" v-model="velocity" v-bind:disabled="ignoreVelocity"/>
            </b-form-group>
            <b-form-group label="Channel" label-cols="4" label-cols-lg="3" label-cols-xl="2">
                <b-form-checkbox v-model="ignoreChannel">Ignore</b-form-checkbox>
                <b-form-input type="number" min="0" max="15" v-model="channel" v-bind:disabled="ignoreChannel"/>
            </b-form-group>
            <b-form-group label="Type" label-cols="4" label-cols-lg="3" label-cols-xl="2">
                <b-form-select v-bind:options="validTypeOptions" v-model="type" />
            </b-form-group>
        </div>
    </b-card>
</template>
<script>
export default {
    name: 'MIDIEventCard',
    props: ['targetType'],
    data () {
        return {
            controller: '',
            ignoreNote: false,
            note: 0,
            ignoreVelocity: false,
            velocity: 0,
            ignoreChannel: false,
            channel: 0,
            type: 'noteon',
            validTypeOptions: ['noteon', 'noteoff'],
            inputDevices: AppData.Adapter.MIDIListener.InputDevices,
            outputDevices: AppData.Adapter.MIDIListener.OutputDevices
        }
    },
    methods: {
        toObject() {
            return {
                controller: this.$data.controller,
                note: this.$data.ignoreNote ? null : this.$data.note,
                velocity: this.$data.ignoreVelocity ? null : this.$data.velocity,
                channel: this.$data.ignoreChannel ? null :  this.$data.channel,
                type: this.$data.type
            }
        },
        fromObject(data) {
            this.$set(this.$data, 'controller', data.controller)
            this.$set(this.$data, 'note', data.note)
            this.$set(this.$data, 'velocity', data.velocity)
            this.$set(this.$data, 'channel', data.channel)
            this.$set(this.$data, 'type', data.type)
            this.$set(this.$data, 'ignoreNote', data.note == null)
            this.$set(this.$data, 'ignoreVelocity', data.velocity == null)
            this.$set(this.$data, 'ignoreChannel', data.channel == null)
        }
    }
}
</script>