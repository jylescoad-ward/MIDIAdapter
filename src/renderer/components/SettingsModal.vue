<template>
    <div>
        <b-modal ref="mod" title="Settings" @hidden="onHide">
            <b-card title="OBS Settings">
                <b-form-group label="Address" label-cols="2">
                    <b-form-input v-model="obsAddress" placeholder="127.0.0.1:4444" />
                </b-form-group>
                <b-form-group label="Password" label-cols="2">
                    <b-form-input type="password" v-model="obsPassword" />
                </b-form-group>
            </b-card>
            <template #modal-footer>
            </template>
        </b-modal>
    </div>
</template>
<script>
export default {
    name: 'SettingsModal',
    data () {
        return {
            obsAddress: AppData.CloudConfig.OBS.get('address'),
            obsPassword: AppData.CloudConfig.OBS.get('password')
        }
    },
    methods: {
        show () {
            this.$refs.mod.show()
        },
        hide () {
            this.$refs.mod.hide()
        },
        onHide () {
            AppData.CloudConfig.OBS.set('address', this.$data.obsAddress)
            AppData.CloudConfig.OBS.set('password', this.$data.obsPassword)
            AppData.CloudConfig.OBS.write()
        }
    }
}
</script>