export const defaultServices = [
    { id:"1", name: 'iStoreOS', icon: 'simple-icons:openwrt', url: 'http://192.168.100.1', type: 'link', desc: '路由管理' },
    { id:"2", name: 'CPE 终端', icon: 'material-symbols:cell-tower', url: 'http://192.168.1.1', type: 'link', desc: '网络管理' },
    { id:"3", name: 'Gitea', icon: 'simple-icons:gitea', url: 'http://192.168.100.1:3001', type: 'link', desc: '代码托管' },
    { id:"4", name: '文件管理', icon: 'ph:folder-open-duotone', url: 'http://192.168.100.1:8897', type: 'link', desc: '' },
    { id:"5", name: 'Immich', icon: 'simple-icons:immich', url: 'http://192.168.100.1:2283', type: 'link', desc: '私人照片云' },
    { id:"6", name: 'Aria2', icon: 'material-symbols:download-rounded', url: 'http://192.168.100.1/ariang/#!/downloading', type: 'link', desc: '远程下载' },
    { id:"7", name: 'Navidrome', icon: 'ph:music-notes-duotone', url: 'http://192.168.100.1:4533', type: 'link', desc: '音乐云盘' },
    { id:"8", name: 'Nikki', icon: 'material-symbols:vpn-lock-rounded', url: 'https://192.168.100.1:9443/ui/?host=192.168.100.1&hostname=192.168.100.1&port=9443&secret=269896#/proxies', type: 'link', desc: '代理服务' },
    { id:"9", name: 'Docker', icon: 'bxl:docker', url: 'http://192.168.100.1:8807/dpanel/ui/home/overview', type: 'link', desc: 'Compose 管理器'},
    { id:"10",name: 'MySQL', icon: 'logos:mysql', value: '3306', type: 'info', desc: '开发数据库' },
    { id:"11",name: 'Redis', icon: 'logos:redis', value: '6379', type: 'info', desc: '缓存服务' },
    { id:"12",name: 'Ubuntu', icon: 'logos:ubuntu', value: 'ssh root@192.168.100.1:2022', type: 'copy', desc: '核心服务器' },
];