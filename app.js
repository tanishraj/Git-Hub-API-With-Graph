var app = angular.module('myApp', []);

app.controller('gitHubCtrl', function($scope, $http){
	$scope.getGitInfo = function() {
		$scope.userNotfound = false;
		$scope.loaded = false;
		$scope.loadedCommit = false;
		$scope.repoNotFound = false;

		/*
		=======================================
		RETRIEVING USER DETAILS
		=======================================
		*/
		$http.get('https://api.github.com/users/' + $scope.userName)
			.success(function(data){
				if(data.name == "")
					data.name = data.login;
				$scope.user = data;
				$scope.loaded = true;
			})
			.error(function(){
				$scope.userNotfound = true;
			})

			var dataArray = [];
			var tempArray = ['repoName','commits'];
			dataArray.push(tempArray);

		/*
		=======================================
		RETRIEVING REPOSITORIES NAMES
		=======================================
		*/
		$http.get('https://api.github.com/users/' + $scope.userName + '/repos')
			.success(function(data){
				$scope.repos = data;
				$scope.reposFound = data.length > 0;

				/*
				=======================================
				INITIALIZING PIE CHART 
				=======================================
				*/
				google.charts.load('current', {packages: ['corechart']});
				google.charts.setOnLoadCallback(fillSalesTable);

				function fillSalesTable(){
					console.log("Hee");
					var status = data.length;
					var count = 0;

					$(data).each(function(index, value){
						$http.get('https://api.github.com/repos/' + value.full_name + '/commits')
						.success(function(data){
							dataArray.push([value.name, parseInt(data.length)])
							count += 1;
							if(count == status){
								drawChart(dataArray);
							}
						})
					})
				}
			});
	}


	/*
	===============================================
	METHOD TO DISPLAY COMMIT MESSAGES FOR EACH REPO
	===============================================
	*/
	$scope.getCommitInfo = function(repo){
		$scope.loadedCommit = false;
		$scope.repoNotFound = false;

		$http.get('https://api.github.com/repos/' + repo.full_name + '/commits')
			.success(function(data){
				$scope.loadedCommit = true;
				$scope.repoId = repo.id;
				$scope.commits = data;
			})
			.error(function(){
				$scope.repoNotFound = true;
			})
	}


	/*
	===============================================
	METHOD TO VISUALIZE THE GRAPH WITH DATA
	===============================================
	*/
	function drawChart(dataArray){
		var arrData = new google.visualization.arrayToDataTable(dataArray);
		var options = {
			title:'Commits For Each Repo',
			is3D: true,
			backgroundColor: '#ddd',
			fontSize: 10,
			chartArea:{left: 10, top: 40, width:'100%', height: '100%'}
		};

		var chart = new google.visualization.PieChart(document.getElementById('pieChartArea'));
		chart.draw(arrData, options);
	}
});

