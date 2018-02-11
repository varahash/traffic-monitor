$(document).ready(function () {
	var origin = window.location.origin

	var newDataSet = {};
	var oldDataSet = {};
	var lastTimeUpdate = new Date().getTime();

	var srcTotalSize = 0;
	var dstTotalSize = 0;
	var srcTotalSpeed = 0;
	var dstTotalSpeed = 0;

	function mergeHost(newMap, oldMap) {
		for (var key in newMap) {
			if (oldMap[key])
				newMap[key][0] = oldMap[key][0];
			else
				setHostNameForIP(newMap[key][1]);
		}
	}

	function setHostNameForIP(ip) {
		$.ajax({
			url: `${origin}/cgi-bin/hostname?ip=${ip}`,
			success: function (response) {
				newDataSet[ip][0] = response;
			}
		});
	}

	function loadHosts() {
		for (var key in newDataSet) {
			setHostNameForIP(newDataSet[key][1]);
		}
	}

	function convertToSpeed(speed) {
		return filesize(speed, { bits: true, base: 10 }) + "/s";
	}

	function parseCSV(data) {
		srcTotalSize = dstTotalSize = 0;
		srcTotalSpeed = dstTotalSpeed = 0;
		var tempDataSet = {};
		var rows = data.split('\n');
		for (var i = 1; i < rows.length - 1; i++) {
			var elementData = [''];
			elementData.splice.apply(elementData, [1, 0].concat(rows[i].split(';')));

			if (!jQuery.isEmptyObject(oldDataSet)) {
				var oldElem = oldDataSet[elementData[1]];
				if (oldElem) {
					var time = (new Date().getTime() - lastTimeUpdate) / 1000;
					var srcSpeed = (elementData[3] - oldElem[3]) / time;
					var dstSpeed = (elementData[5] - oldElem[5]) / time;
					elementData[6] = srcSpeed;
					elementData[7] = dstSpeed;
				} else {
					elementData[6] = 0;
					elementData[7] = 0;
				}
			} else {
				elementData[6] = 0;
				elementData[7] = 0;
			}

			srcTotalSize += parseInt(elementData[3]);
			dstTotalSize += parseInt(elementData[5]);

			srcTotalSpeed += elementData[6];
			dstTotalSpeed += elementData[7];

			tempDataSet[elementData[1]] = elementData;
		}
		return tempDataSet;
	}

	var table = $("#traffic-table").DataTable({
			columnDefs: [{
					render: function (data) {
						return filesize(data);
					},
					targets: [3, 5]
				}, {
					render: function (data) {
						return convertToSpeed(data);
					},
					targets: [6, 7]
				}, {
					type: 'ip-address',
					targets: 1
				}, {
					type: 'file-size',
					targets: [3, 5, 6, 7]
				}, {
					targets: [2, 4],
					visible: false
				}
			],
			bPaginate: false,
			data: Object.keys(newDataSet).map(function (key) {
				return newDataSet[key];
			}),
			order: [[1, "asc"]],
			columns: [{
					title: "Hostname"
				}, {
					title: "IP address"
				}, {
					title: "SRC packets"
				}, {
					title: "Uploaded"
				}, {
					title: "DST packets"
				}, {
					title: "Downloaded"
				}, {
					title: "Up Speed"
				}, {
					title: "Down Speed"
				}
			],
			footerCallback: function() {
				var api = this.api();
				$(api.column(3).footer()).html(
			        filesize(srcTotalSize)
			    );
			    $(api.column(5).footer()).html(
			        filesize(dstTotalSize)
			    );
			    $(api.column(6).footer()).html(
			        convertToSpeed(srcTotalSpeed)
			    );
			    $(api.column(7).footer()).html(
			        convertToSpeed(dstTotalSpeed)
			    );
			}
		});

	var requestTimer = setInterval(ajax_call, 1000);

	var ajax_call = function () {
		clearInterval(requestTimer);
		$.ajax({
			url: `${origin}/cgi-bin/traffic_usage`,
			success: function (response) {
				oldDataSet = newDataSet;
				newDataSet = parseCSV(response);
				if (!jQuery.isEmptyObject(oldDataSet))
					mergeHost(newDataSet, oldDataSet);
				else
					loadHosts();
				lastTimeUpdate = new Date().getTime();
				table.clear();
				table.rows.add(Object.keys(newDataSet).map(function (key) {
						return newDataSet[key];
					}));
				table.draw();
				requestTimer = setInterval(ajax_call, 1000);
			}
		})

	};

	ajax_call();

});
