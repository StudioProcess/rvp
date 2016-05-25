/**
 * @ngdoc function
 * @name rvApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the rvApp
 */
export default function MainCtrl($log, db) {
  this.awesomeThings = [
    'HTML5 Boilerplate',
    'AngularJS',
    'Karma'
  ];
  $log.log('Controller: MainCtrl');

  db.init();
  console.log(db);
}
