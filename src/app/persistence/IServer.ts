import * as fromProject from '../core/reducers/project'

export default interface IServer {
  fetchDefaultProject(): fromProject.State
}
