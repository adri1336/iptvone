const IPTV = () => {};

export default IPTV;

IPTV.url = "";
IPTV.getURL = () => IPTV.url;
IPTV.setURL = url => IPTV.url = url;

IPTV.groups = [];
IPTV.getGroups = () => IPTV.groups;
IPTV.setGroups = groups => IPTV.groups = groups;

IPTV.items = [];
IPTV.getItems = () => IPTV.items;
IPTV.setItems = items => IPTV.items = items;

IPTV.getRawValue = (raw, key) => {
    const value = raw.split(key + '="')[1];
    return value ? value.split('"')[0] : null;
}