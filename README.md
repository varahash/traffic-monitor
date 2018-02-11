# traffic-monitor

This is LEDE/OpenWrt package which provides web UI to track users bandwidth usage.

![traffic-monitor](https://user-images.githubusercontent.com/6864532/36072425-3086cfd0-0f28-11e8-9f08-9765a90ddaab.png)

## Package dependencies

This package has following dependencies: 

- iptaccount
- coreutils-timeout
- samba36-client
- memcached



## Building ##

To build ipk package just run following command:

```shell
$ ./build.sh
```


## Installation

To install ipk on your router, you can execute following commands:

```shell
$ scp build/traffic-monitor_*_all.ipk <username>@<router_ip>:/tmp
$ ssh <username>@<router_ip>
$ cd /tmp
$ opkg update
$ opkg install traffic-monitor_*_all.ipk
```

Then open http://<router_ip>/traffic-monitor/index.html link in your favorite browser.
