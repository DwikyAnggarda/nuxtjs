export default [
    {
        subheader : [
            {   
                roles: ['superuser','kesiswaan','keuangan'],
                type: 'subheader', 
                icon: 'mdi-chart-bar',
                title: 'Dashboard',
                subitems : [
                    {
                        roles: ['superuser','kesiswaan','keuangan'],
                        title: 'SSC Buduran',
                        to: '/',
                        icon: 'mdi-layers-triple-outline'
                    }
                    // {
                    //     roles: ['superuser','kesiswaan','keuangan'],
                    //     title: 'RCU Education',
                    //     to: '/dashboard_rcu',
                    //     icon: 'mdi-layers-triple-outline'
                    // }
                ]
            },
            { 
                roles: ['superuser','keuangan'],
                type: 'subheader', 
                icon: 'mdi-account-box-outline',
                title: 'User',
                subitems : [
                    {
                        roles: ['superuser'],
                        title: 'Users',
                        to: '/users',
                        icon: 'mdi-layers-triple-outline',
                    },
                    {
                        roles: ['superuser','keuangan'],
                        title: 'Siswa SSC',
                        to: '/siswa',
                        icon: 'mdi-layers-triple-outline',
                    },
                    {
                        roles: ['superuser','keuangan'],
                        title: 'Users RCU',
                        to: '/siswa-rcu',
                        icon: 'mdi-layers-triple-outline',
                    },
                    {
                        roles: ['superuser','keuangan'],
                        title: 'Import Siswa SSC',
                        to: '/siswa/import',
                        icon: 'mdi-layers-triple-outline',
                    },
                    {
                        roles: ['superuser','keuangan'],
                        title: 'Import Siswa RCU',
                        to: '/siswa-rcu/import',
                        icon: 'mdi-layers-triple-outline',
                    }
                ]
            },
            { 
                roles: ['superuser','keuangan'],
                type: 'subheader', 
                icon: 'mdi-credit-card-outline',
                title: 'Pembayaran',
                subitems : [
                    {
                        roles: ['superuser','keuangan'],
                        title: 'Pembayaran',
                        to: '/payment',
                        icon: 'mdi-layers-triple-outline',
                    },
                    {
                        roles: ['superuser'],
                        title: 'Rekening',
                        to: '/rekening',
                        icon: 'mdi-layers-triple-outline',
                    },
                ]
            },
            { 
                roles: ['superuser','kesiswaan'],
                type: 'subheader', 
                icon: 'mdi-database-outline',
                title: 'Data Induk',
                subitems : [
                    {
                        roles: ['superuser','kesiswaan'],
                        title: 'Kelas',
                        to: '/kelas',
                        icon: 'mdi-layers-triple-outline',
                    },
                    {
                        roles: ['superuser','kesiswaan'],
                        title: 'Mata Pelajaran',
                        to: '/mapel',
                        icon: 'mdi-layers-triple-outline',
                    },
                    {
                        roles: ['superuser','kesiswaan'],
                        title: 'Kategori Subtes',
                        to: '/kategori-subtes',
                        icon: 'mdi-layers-triple-outline',
                    },
                    {
                        roles: ['superuser','kesiswaan'],
                        title: 'Passing Grade',
                        to: '/passing-grade',
                        icon: 'mdi-layers-triple-outline',
                    }
                ]
            },
            { 
                type: 'subheader', 
                icon: 'mdi-inbox-full-outline',
                roles: ['superuser'],
                title: 'Pengaturan',
                subitems: [
                    {
                        roles: ['superuser'],
                        title: 'Users',
                        to: '/users',
                        icon: 'mdi-folder-outline',
                    },
                    {
                        roles: ['superuser'],
                        title: 'Role Management',
                        to: '/role',
                        icon: 'mdi-folder-outline',
                    },
                    // ,
                    // {
                    //     roles: ['superuser','kesiswaan'],
                    //     title: 'Subtes',
                    //     to: '/subtest',
                    //     icon: 'mdi-folder-outline',
                    // },
                    // {
                    //     roles: ['superuser','kesiswaan'],
                    //     title: 'Tryout',
                    //     to: '/tryout',
                    //     icon: 'mdi-folder-outline',
                    // },
                    // {
                    //     roles: ['superuser','kesiswaan'],
                    //     title: 'Paket SSC',
                    //     to: '/paket',
                    //     icon: 'mdi-folder-outline',
                    // },
                    // {
                    //     roles: ['superuser','kesiswaan'],
                    //     title: 'Paket RCU',
                    //     to: '/paket-rcu',
                    //     icon: 'mdi-folder-outline',
                    // },
                    // {
                    //     roles: ['superuser','kesiswaan'],
                    //     title: 'Materi',
                    //     to: '/materi',
                    //     icon: 'mdi-inbox-full-outline',
                    // },
                    // {
                    //     roles: ['superuser','kesiswaan'],
                    //     title: 'Blast Notification',
                    //     to: '/notif/blast',
                    //     icon: 'mdi-share-variant-outline',
                    // },
                    // {
                    //     roles: ['superuser','kesiswaan'],
                    //     title: 'List Pengumuman',
                    //     to: '/notif/announcement',
                    //     icon: 'mdi-format-list-bulleted',
                    // },
                    // {
                    //     roles: ['superuser','kesiswaan'],
                    //     title: 'Generate Tryout',
                    //     to: '/tryout/generate',
                    //     icon: 'mdi-cog',
                    // },
                    // {
                    //     roles: ['superuser'],
                    //     title: 'List Log',
                    //     to: '/log',
                    //     icon: 'mdi-format-list-bulleted',
                    // },
                ]
            },
            // { 
            //     type: 'subheader',
            //     icon: 'mdi-chart-timeline-variant' ,
            //     roles: ['superuser','kesiswaan'],
            //     title: 'Penilaian',
            //     subitems: [
            //         {
            //             roles: ['superuser','kesiswaan'],
            //             title: 'Nilai Tryout Siswa',
            //             to: '/nilai',
            //             icon: 'mdi-format-list-bulleted',
            //         },
            //         {
            //             roles: ['superuser','kesiswaan'],
            //             title: 'Summary Siswa',
            //             to: '/summary_siswa',
            //             icon: 'mdi-format-list-bulleted',
            //         },
            //     ]
            // },
            { 
                type: 'subheader',
                icon: 'mdi-chart-timeline-variant' ,
                roles: ['superuser'],
                title: 'Kerusakan Jalan',
                subitems: [
                    {
                        roles: ['superuser'],
                        title: 'Peta',
                        to: '/finding/map',
                        icon: 'mdi-format-list-bulleted',
                    },
                    {
                        roles: ['superuser'],
                        title: 'Laporan Kerusakan',
                        to: '/finding',
                        icon: 'mdi-format-list-bulleted',
                    }
                ]
            },
        ],
        
        open : [
            'Dashboard','User','Pembayaran','Data Induk','Pengaturan Soal','Penilaian'
        ]
    }
]