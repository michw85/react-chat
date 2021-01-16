const userListContainer = document.body.querySelector( "#user-list" ) ;
if( ! userListContainer ) throw "user list container location error" ;

const conversationContainer = document.body.querySelector( "#conversation" ) ;
if( ! conversationContainer ) throw "conversation container location error" ;

const e = React.createElement ;


/*
 *  UserList Component
 */
class UserList extends React.Component {
    constructor( props ) {
        super( props ) ;
        this.state = {
            userList: []
        }
        this.userClick = this.userClick.bind( this ) ;
    }

    componentDidMount() {
        /*  // установить соединение с Клиентом посредством fetch;
        fetch( 'http://localhost:8080/userlist' )
        .then( r => r.json() )
        .then( j => {
            console.log(j)
            this.setState( { userList: j } ) ;
        });
        */

        let s = new WebSocket( "ws://localhost:8080/userlist" ) ;  // Установить соединение с Клиентом посредством websocket;
        s.onerror = err => {                                       // Error: выпадает уведомление о неудачном соединении. Eсли же во время работы пропадает соединение, то вывести уведомление о потери соединения
            alert( "потеря соединения" ) ; 
        } ;
        s.onmessage = (m) => {                                     // Success: сервер отдает Список пользователей <UserList> 
            this.setState( { userList: JSON.parse( m.data ) } ) ;
        } ;
    }

    render() {
        // Изначально На компоненте <UserList> отображается лоадер;
        if( this.state.userList.length == 0 ) {
            return e( 'img', { src: 'loader.gif' }, null ) ;       // loader
        }
        return e( React.Fragment, {}, 
            this.state.userList.map( u =>
                e( 'div', { className: "userlist", key: u.id, onClick: ()=>{ this.userClick( u ) } }, 
                e( 'img', { src: u.avatar }, null ),
                    e( 'b', {}, u.name )
                     )
   
        ) ) ;
    }

    userClick( u ) {
        var msg = new CustomEvent( 'userchanges', { detail: u } ) ;    //  Создаем событие
        document.dispatchEvent( msg ) ;                                //  Raise event
    }
}

ReactDOM.render( e( UserList, {}, null ), userListContainer ) ;



/*
 *  Conversation Component
 */
class Conversation extends React.Component {
    constructor( props ) {
        super( props ) ;
        this.state = {
                activeUser: null, 
                msglist: [],
                value: '',
                added: false
        };
        this.onUserChanges = this.onUserChanges.bind( this ) ;
    }

    handleChange(event) {
		this.setState({value: event.target.value});
    }
    
    handleClick () {                                                      // Отправка сообщений на сервер и отрисовка отправленного сообщения в чате
        alert('Сообщение отправлено на сервер:' + this.state.value )
        let s = new WebSocket( "ws://localhost:8080/addmsg" ) ;
        s.onopen = ()=>{ s.send(this.state.value) ; } ;
        s.onmessage = (m)=>{ if( m.data == "Added" ) this.setState( { added: true } ) };
      }

    componentDidMount() {
        document.addEventListener( 'userchanges', this.onUserChanges ) ;  // Подписываемся на событие (выбрасываемое UserList-ом)
    }
    render() {
        if( this.state.activeUser == null ) {                             // Если не было клика на userList - вместо пустого поля
           return e( 'div', {className: "conversation"}, 
                    e( 'div',{className: "conversation__avatar"},
                        e('img', {src: "http://localhost:8080/img/user.jpg"}, null),
                        e( 'b', {className: "conversation__text"}, "Выберите пользователя" ) ), 
                ) ;
        }
        
        return  e( React.Fragment, {}, 
                    e('div', {className: "conversation"},
                        e('div', {className: "conversation__field"},
                            e( 'img', { src:  this.state.activeUser.avatar }, null ),
                            e( 'b', {}, this.state.activeUser.name ),
                            this.state.msglist.map(m => e( 'p', {key: m.id}, m.txt)),   // loader
                            e( 'p', {}, this.state.added ? this.state.value : '...' ),
                            e('div', {id: "log"} )
                        ),
                        e('div', {className: "conversation__input"},
                            e('input', {id: "conversation__input-msg", placeholder: "Введите текст сообщения...", onChange: this.handleChange.bind(this)}, /*this.state.value*/ ),
                            e ('button', {id: "conversation__input-btn", type: "submit", className:"btn btn-primary btn-sm", onClick: this.handleClick.bind(this)}, "Send")
                        )
                    )
         ) ;  
    }
    onUserChanges(e) {                                                                  // Получение данных от server
        // console.log(e.detail);
        this.setState({activeUser: e.detail});
        let s = new WebSocket( "ws://localhost:8080/usermsg/"+e.detail.id ) ;  
        s.onerror = err => {   
            alert( "потеря соединения" ) ; 
        } ;
        s.onmessage = (m) => {    
            // console.log(m.data);
            this.setState({msglist: JSON.parse(m.data)})
        } ;
    }
}

ReactDOM.render( e( Conversation, {}, null ), conversationContainer ) ;