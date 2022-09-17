<template>
    <div>
        <b-modal ref="eventModal" title="Edit Event" no-body size="xl">
            <b-form-group prepend="Label">
                <b-form-input v-model="(eventData || {label: ''}).label" />
            </b-form-group>
            <div v-if="eventData != null">
                <b-col>
                    <b-row>
                        <b-col style="border-right: 1px solid black"><h2>Input</h2></b-col>
                        <b-col><h2>Output</h2></b-col>
                    </b-row>
                    <b-row>
                        <b-col style="border-right: 1px solid black">
                            <b-row>
                                <b-col><strong>Name</strong></b-col>
                                <b-col cols="auto">
                                    <b-button @click="createComponent('on')" size="sm"><b-icon icon="plus"></b-icon></b-button>
                                </b-col>
                            </b-row>
                            <template v-for="(item, index) in eventData.on">
                                <b-row v-bind:key="`eventData-on-${index}`">
                                    <b-col>{{Object.fromEntries(componentTypes)[item.type]}} Event</b-col>
                                    <b-col cols="auto">
                                        <!-- <b-button-group>
                                            <b-button size="sm"> <b-icon icon="chevron-up"></b-icon> </b-button>
                                            <b-button size="sm"> <b-icon icon="chevron-down"></b-icon> </b-button>
                                        </b-button-group> -->
                                        <b-button-group>
                                            <b-button variant="secondary" size="sm" @click="editComponent(item, index, 'on')"><b-icon icon="pencil"></b-icon></b-button>
                                            <b-button variant="danger" size="sm" @click="removeComponent(item, index, 'on')"> <b-icon icon="trash"></b-icon> </b-button>
                                        </b-button-group>
                                    </b-col>
                                </b-row>
                            </template>
                        </b-col>
                        <b-col>
                            <b-row>
                                <b-col><strong>Name</strong></b-col>
                                <b-col cols="auto">
                                    <b-button @click="createComponent('then')" size="sm"><b-icon icon="plus"></b-icon></b-button>
                                </b-col>
                            </b-row>
                            <template v-for="(item, index) in eventData.then">
                                <b-row v-bind:key="`eventData-then-${index}`">
                                    <b-col>{{Object.fromEntries(componentTypes)[item.type]}} Event</b-col>
                                    <b-col cols="auto">
                                        <!-- <b-button-group>
                                            <b-button size="sm"> <b-icon icon="chevron-up"></b-icon> </b-button>
                                            <b-button size="sm"> <b-icon icon="chevron-down"></b-icon> </b-button>
                                        </b-button-group> -->
                                        <b-button-group>
                                            <b-button variant="secondary" size="sm" @click="editComponent(item, index, 'then')"><b-icon icon="pencil"></b-icon></b-button>
                                            <b-button variant="danger" size="sm" @click="removeComponent(item, index, 'then')"> <b-icon icon="trash"></b-icon> </b-button>
                                        </b-button-group>
                                    </b-col>
                                </b-row>
                            </template>
                        </b-col>
                    </b-row>
                </b-col>
            </div>
            <template #modal-footer>
                <b-button @click="discard" size="sm" variant="danger">Discard Changes</b-button>
                <b-button @click="save" size="sm" variant="primary">Save</b-button>
            </template>
        </b-modal>
        <b-modal ref="componentModal" title="Edit Component" size="xl">
            <template v-if="selectedComponent != null">
                <b-form-group label="Delay" label-cols="4" label-cols-lg="3" label-cols-xl="2">
                    <b-input-group append="ms">
                        <b-form-input type="number" v-model="selectedComponent.delay" />
                    </b-input-group>
                </b-form-group>
                <b-form-group label="Event Type" label-cols="4" label-cols-lg="3" label-cols-xl="2">
                    <select v-model="selectedComponent.type">
                        <template v-for="pair in validComponentTypes.filter(v => typeof v[1] != 'string')">
                            <option v-bind:key="`componentType-${pair[1]}`" :value="pair[1]" v-bind:selected="selectedComponent.type.toString() == pair[1].toString()">{{pair[0]}}</option>
                        </template>
                    </select>
                </b-form-group>
                <template v-if="selectedComponent.type.toString() == '0' && selectedComponentKey == 'then'">
                    <OBSOutputEventCard ref="obsOutputEventCard" />
                </template>
                <template v-if="selectedComponent.type.toString() == '1'">
                    <MIDIEventCard ref="midiEventCard" v-bind:targetType="selectedComponentKey == 'then' ? 'out' : selectedComponentKey == 'on' ? 'in' : ''" />
                </template>
            </template>
            <template #modal-footer>
                <b-button @click="discardComponent" size="sm" variant="danger">Discard Changes</b-button>
                <b-button @click="saveComponent" size="sm" variant="primary">Save</b-button>
            </template>
        </b-modal>
    </div>
</template>
<script>
import OBSOutputEventCard from './OBSOutputEventCard.vue'
import MIDIEventCard from './MIDIEventCard.vue'
export default {
    name: 'EventEditModal',
    components: {OBSOutputEventCard, MIDIEventCard},
    data () {
        return {
            eventData: null,
            selectedComponent: null,
            selectedComponentIndex: 0,
            selectedComponentKey: '',
            componentTypes: Object.entries(require('../coordinator/index').EventType)
        }
    },
    methods: {
        setData (data) {
            this.$set(this.$data, 'eventData', data)
        },
        show () {
            this.$refs.eventModal.show()
        },
        hide () {
            this.$refs.eventModal.hide()
        },

        save () {
            this.$refs.eventModal.hide()
            this.$emit('save', this.$data.eventData)
        },
        discard () {
            this.$refs.eventModal.hide()
            this.$emit('discard', this.$data.eventData)
        },

        createComponent (type) {
            let instance = {
                type: 0,
                data: {
                    event: '',
                    data: ''
                },
                delay: 0
            }
            this.$data.eventData[type].push(instance)
            let index = this.$data.eventData[type].length - 1
            this.editComponent(this.$data.eventData[type][index], index, type)
        },
        editComponent (item, index, type) {
            console.log(arguments)
            this.$set(this.$data, 'selectedComponent', JSON.parse(JSON.stringify(item)))
            this.$set(this.$data, 'selectedComponentIndex', index)
            this.$set(this.$data, 'selectedComponentKey', type)
            this.$refs.componentModal.show()
            setTimeout(() => {
                if (this.$refs.obsOutputEventCard != undefined)
                    this.$refs.obsOutputEventCard.fromObject(this.$data.selectedComponent.data)
                if (this.$refs.midiEventCard != undefined)
                    this.$refs.midiEventCard.fromObject(this.$data.selectedComponent.data)
            }, 300)
        },
        removeComponent (item, index, type)
        {
            let newArray = []
            for (let i = 0; i < this.$data.eventData[type].length; i++) {
                if (i != index)
                    newArray.push(this.$data.eventData[type][i])
            }
            this.$set(this.$data.eventData, type, newArray)
        },
        saveComponent () {
            console.log(this.$data)
            let obj = {}
            if (this.$refs.obsOutputEventCard != undefined)
                obj = this.$refs.obsOutputEventCard.toObject()
            if (this.$refs.midiEventCard != undefined)
                obj = this.$refs.midiEventCard.toObject()
            console.log(obj)
            this.$set(
                this.$data.eventData[this.$data.selectedComponentKey][this.$data.selectedComponentIndex],
                'data',
                JSON.parse(JSON.stringify(obj)))
                // selectedComponent.type
            this.$set(
                this.$data.eventData[this.$data.selectedComponentKey][this.$data.selectedComponentIndex],
                'type',
                this.$data.selectedComponent.type)

            this.$refs.componentModal.hide()
        },
        discardComponent () {
            this.$refs.componentModal.hide()
        }
    },
    updated () {
        if (this.$data.selectedComponent != undefined && this.$data.selectedComponent != null)
        {
            if (this.$refs.obsOutputEventCard != undefined)
                this.$refs.obsOutputEventCard.fromObject(this.$data.selectedComponent.data)
            if (this.$refs.midiEventCard != undefined)
                this.$refs.midiEventCard.fromObject(this.$data.selectedComponent.data)
        }
    },
    computed: {
        validComponentTypes () {
            if (this.$data.selectedComponentKey == 'on') {
                return [
                    ['MIDI', 1]
                ]
            } else {
                return this.$data.componentTypes
            }
        }
    }
}
</script>