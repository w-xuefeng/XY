<template>
  <div class="player" ref="player" :class="{hideYscroll : (swiper.activeIndex === 0 || swiper.activeIndex === 2) && !isSearch }">
    <mu-appbar style="width: 100%;position:fixed;top:0;" :color="themes.isLight ? 'primary' : ''">
      <mu-button icon slot="left" @click="drawer.open = !drawer.open">
        <mu-icon value="menu" v-if="!songUrlGetting"></mu-icon>
        <mu-icon value="donut_large" class="spanquick" v-if="songUrlGetting"></mu-icon>
      </mu-button>
      
      <span v-if="!isSearch">{{Apptitle}}</span>
      <span v-if="isSearch && songUrlGetting">{{songUrlGettingText}}</span>        
      <span v-if="isSearch && !songUrlGetting && (curSong.singer + curSong.songName).split('').length < 15">{{curSong.singer}} - {{curSong.songName}}</span>
      <span v-if="isSearch && !songUrlGetting && (curSong.singer + curSong.songName).split('').length >= 15"  style="display: block;height: 56px;"> 
        <marquee :scrollamount="2"  behavior="alternate" direction="left">{{curSong.singer}} - {{curSong.songName}}</marquee>       
      </span>
    
    </mu-appbar>

    <mu-drawer :open.sync="drawer.open" :docked="drawer.docked">
      <mu-list>
        <mu-list-item button :ripple="true">
          <mu-list-item-title>
            {{themes.isLight ? themes.white : themes.light}}主题
          </mu-list-item-title>
          <mu-list-item-action>
            <mu-switch v-model="themes.isLight"></mu-switch>
          </mu-list-item-action>
        </mu-list-item>

        <mu-list-item button :ripple="true">
          <mu-list-item-title>
            <span v-if="isCircle">矩形边框</span>
            <span v-if="!isCircle">圆角边框</span>
          </mu-list-item-title>
          <mu-list-item-action>
            <mu-switch v-model="isCircle"></mu-switch>
          </mu-list-item-action>
        </mu-list-item>

        <mu-list-item button :ripple="true">
          <mu-list-item-title>
            后端服务器地址:
          </mu-list-item-title>
        </mu-list-item>
        <mu-list-item button :ripple="false">
          <mu-list-item-action>
            <mu-text-field v-model="HOST"></mu-text-field>
          </mu-list-item-action>
        </mu-list-item> 

        <mu-list-item button :ripple="true">
          <mu-list-item-title>
            后端服务器端口:
          </mu-list-item-title>
        </mu-list-item>
        <mu-list-item button :ripple="false">
          <mu-list-item-action>
            <mu-text-field v-model="PART"></mu-text-field>
          </mu-list-item-action>
        </mu-list-item>                      
      </mu-list>


    <mu-container>
      <p style="text-align:center">感谢您的支持 🙇‍:</p>    
      <mu-card style="width: 60%; margin: 10px auto;">
        <mu-card-media>
          <img src="https://pub.wangxuefeng.com.cn/feed/qrcode_onlyqr_feedme_ailpay.png">
        </mu-card-media>
      </mu-card>
      <p style="text-align:center">支付宝 Alipay</p>
      <mu-card style="width: 60%; margin: 10px auto;">
        <mu-card-media>
          <img src="https://pub.wangxuefeng.com.cn/feed/qrcode_onlyqr_feedme_wechat.png">
        </mu-card-media>
      </mu-card>
      <p style="text-align:center">微信 WeChat</p>
    </mu-container>




    </mu-drawer>

    <div v-elevation="4" class="searchBar" :class="{searchBarActive: isSearch, middleSearch : swiper.activeIndex === 0 }">
      <mu-text-field v-model="search" placeholder="搜索音乐......" full-width  @focus="setSearch" @blur="falseSearch" action-icon="search"  :action-click='() => { searchSong() }' @keyup.enter="searchSong()"></mu-text-field>
    </div>

    <mu-paper :z-depth="1" v-if="isSearch">
      <mu-sub-header :class="{gohome:isSearch}">
        <mu-list v-if="searching" >
          <mu-list-item button :ripple="false">
            <mu-list-item-action>
              <mu-icon value="donut_large" class="spanquick"></mu-icon>
            </mu-list-item-action>
            <mu-list-item-title>{{searchingText}}</mu-list-item-title>
          </mu-list-item>
        </mu-list>
        <span v-if="!searching" >{{searchResText}}</span>
      </mu-sub-header>
      <mu-list textline="two-line" v-for="(song, index) in songList" :key="index">      
        <mu-list-item avatar v-if="songList.length > 1" :ripple="true" button @click="playThis(song, index)">
          <mu-list-item-action>
            <mu-avatar>
              <img :src="song.artists[0].img1v1Url">
            </mu-avatar>
          </mu-list-item-action>
          <mu-list-item-content>
            <mu-list-item-title>{{song.name}}</mu-list-item-title>
            <mu-list-item-sub-title>            
              {{song.artists[0].name}}
            </mu-list-item-sub-title>
          </mu-list-item-content>        
        </mu-list-item>
        <mu-divider v-if="songList.length > 1"></mu-divider>      
      </mu-list>
    </mu-paper> 


  <div class="swiper-container" v-show="!isSearch" id="xy-swiper-container">
      <div class="swiper-wrapper">
          <div class="swiper-slide">
            <mu-container class="hotSearch">
              <mu-button v-for="(hots, index) in hotSearch" :key="index" flat :color="themes.isLight ? 'primary' : '' " @click="searchSongByStr(hots.first)">{{hots.first}}</mu-button>
            </mu-container>            
          </div>
          <div class="swiper-slide">
            <mu-paper :z-depth="3" style="width: 85%; max-width: 600px; margin: 20px auto 80px auto;background:none;" :class="{'borderCircle':isCircle}">
              <mu-card style="width: 100%; margin: 0px auto;" :class="{'borderCircle':isCircle}">                
                <mu-card-header :title="curSongAlbum.type" :sub-title="curSongAlbum.subType">
                  <mu-avatar slot="avatar">
                    <img :src="curSong.imgSrc">
                  </mu-avatar>                  
                </mu-card-header>
                <mu-card-media :title="curSong.songName" :sub-title="curSong.singer">
                  <img :src="curSong.imgSrc">
                </mu-card-media>
                <mu-card-title :sub-title="'专辑：' + curSongAlbum.name"></mu-card-title>
                <mu-card-text>
                  {{curSongAlbum.description}}
                </mu-card-text>
                <mu-card-actions>
                  <mu-button icon  @click="downCurSong()" :color="themes.isLight ? 'primary' : '' ">
                    <mu-icon :value="songList[curSong.listIndex].isDown ? 'cloud_done' : 'cloud_download'"></mu-icon>
                  </mu-button>
                  <mu-button icon  @click="songList[curSong.listIndex].isFav = !songList[curSong.listIndex].isFav" :color="themes.isLight ? 'secondary' : '' ">
                    <mu-icon :value="songList[curSong.listIndex].isFav ? 'favorite' : 'favorite_border'"></mu-icon>
                  </mu-button>
                </mu-card-actions>
                <a href="javascript:void(0);" ref="download" :download="curSong.singer + '-' + curSong.songName" type="audio/mpeg" v-show="false"></a>
              </mu-card>
            </mu-paper>              
          </div>
          <div class="swiper-slide">
            <scroll class="lyric-wrapper" ref="lyricList" :data="currentLyric && currentLyric.lines">  
              <div>  
                <div class="lyric LRCContainer">  
                  <p v-for="(line,index) in currentLyric.lines" ref="lyricLine" :class="{'current': currentLineNum === index}" class="text">{{line.txt}}</p>
                  <p v-if="!currentLyric.lines">{{curSongLRCText}}</p>
                </div>
              </div>  
            </scroll>
          </div>
      </div>
      <div class="swiper-pagination swiper-pagination-white"></div>
  </div>



    <div class="controlButton" :class="{controlButtonActive: isSearch}">      
      <mu-flex justify-content="center" align-items="center">
        <mu-button fab small color="rgba(0,0,0,0.55)" @click="changePlayerMode()">
           <mu-icon :value="playerModeIcon"></mu-icon>
        </mu-button>        
        <mu-button fab small color="rgba(0,0,0,0.55)" @click="prevPlay">
           <mu-icon value="skip_previous"></mu-icon>
        </mu-button>
        <mu-button fab color="rgba(0,0,0,0.55)" @click="conPlay">
          <mu-icon :value="isPlaying ? 'pause': 'play_arrow'"></mu-icon>
        </mu-button>        
        <mu-button fab small color="rgba(0,0,0,0.55)" @click="nextPlay">
          <mu-icon value="skip_next"></mu-icon>
        </mu-button>
        <mu-button fab small color="rgba(0,0,0,0.55)" @click="showList()">
          <mu-icon value="queue_music"></mu-icon>
        </mu-button>
      </mu-flex>
    </div>

    <div v-elevation="4" class="bottomPlayer">
      <mu-card-header>
        <mu-avatar slot="avatar" style="cursor:pointer;" @click="showAblum()">
          <img :src="curSong.imgSrc" :class="{span: isPlaying}">
        </mu-avatar>
        <div class="mu-card-header-title" style="width:100%;">
          <div class="mu-card-title" :class='{jsutHide: isSearch}'>
            <span v-if="(curSong.singer + curSong.songName).split('').length < 15">{{curSong.singer}} - {{curSong.songName}}</span>
            <span v-if="(curSong.singer + curSong.songName).split('').length >= 15" >
              <marquee :scrollamount="2"  behavior="alternate" direction="left">{{curSong.singer}} - {{curSong.songName}}</marquee>
            </span>
          </div>
          <div class="mu-card-sub-title">
            <mu-slider v-model="curPlayTime" :max="curSong.duration" @touchstart.prevent="setPlayTimeStart()" @touchmove.prevent="setPlayTimeMove()" @touchend="setPlayTimeEnd()"></mu-slider>
            <span style="float:right;">123456</span>
          </div>
        </div>                
      </mu-card-header>
    </div>
    <audio id="audio" ref="audio" v-show="false">
      <source :src="curSong.songUrl" type="audio/mpeg">      
    </audio>
    <mu-snackbar :position="snackbar.position" :open.sync="snackbar.open">
      {{snackbar.message}}
      <mu-button flat slot="action" color="secondary" @click="snackbar.open = false">关闭</mu-button>
    </mu-snackbar>
  </div>
</template>

<script>
import axios from 'axios'
import Swiper from 'swiper'
import Lyric from 'lyric-parser'
import Scroll from './scroll'
import 'swiper/dist/css/swiper.min.css'
export default {
  name: 'player',
  data () {
    return {
      HOST: 'https://api.xy.wangxuefeng.com.cn',
      PART: '443',
      Apptitle: '寻音 | SNP',
      search: '',
      searching: false,
      searchingText: '正在搜索中...',
      searchResText: '搜索结果:',
      isSearch: false,
      songList: [{
        id: 499274374,
        name: "纯白",
        artists: [{
          id: 12025552,
          name: "双笙",
          picUrl: null,
          alias: [],
          albumSize: 0,
          picId: 0,
          img1v1Url: "http://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
          img1v1: 0,
          trans: null
            }],
        album: {
            id: 35975119,
            name: "纯白",
            artist: {
              id: 0,
              name: "",
              picUrl: null,
              alias: [],
              albumSize: 0,
              picId: 0,
              img1v1Url: "http://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
              img1v1: 0,
              trans: null
            },
            publishTime: 1503331200007,
            size: 2,
            copyrightId: 558010,
            status: 0,
            picId: 19147994998024092
        },
        duration: 311268,
        copyrightId: 558010,
        status: 0,
        alias: [],
        rtype: 0,
        ftype: 0,
        mvid: 5619681,
        fee: 8,
        rUrl: null,
        isFav: false,
        isDown: false,
      }],
      isPlaying: false,
      songUrlGetting: false,
      songUrlGettingText: '加载中...',
      curPlayTime: 0,      
      currentLineNum : 0,
      currentLyric: {},
      curSongLRCText: '正在寻找歌词中...',
      timer: null,
      audio: null,
      curSong: {
        listIndex: 0,
        id: 499274374,
        imgSrc: 'http://p3.music.126.net/uNV6L4oOKP3suDHqnZGclQ==/19147994998024092.jpg',
        songUrl: 'https://kcalb.wang/musicplayer/songs/chunbai.mp3',
        songName: '纯白',
        singer: '双笙',
        duration: 312
      },
      curSongAlbum: {
          name: '专辑名',
          description: '专辑描述',
          type: 'EP/Single',
          subType: '录音室版'
      },
      drawer: {
        docked: false,
        open: false
      },
      playerModel: 0,
      playerModeIcon: 'repeat',
      isShowLrc: false,
      themes: {
        isLight: false,
        white: '纯白',
        light: '湛蓝'
      },
      isCircle: false,
      snackbar: {
        position: 'bottom',
        message: ' ',
        open: false,
        timeout: 3000
      },
      swiper: {},
      hotSearch: [],
    }
  },
  methods: {
    setSearch () {
      this.isSearch = true
    },
    showAblum () {
      this.isSearch = false
      document.querySelector('.player').scrollTop = 0    
    },
    showList () {
      this.isSearch = !this.isSearch
      document.querySelector('.player').scrollTop = 0    
    },
    falseSearch () {
      if(this.search === ''){
        this.isSearch = false
      }
    },
    setPlayTimeStart () {
      clearInterval(this.timer)      
    },
    setPlayTimeMove () {
      this.audio.currentTime = this.curPlayTime
      if(this.currentLyric){
        this.currentLyric.seek(this.curPlayTime*1000)
      }
    },
    setPlayTimeEnd () {
      this.audio.currentTime = this.curPlayTime 
      this.bindSeekbar()
      if(this.currentLyric){
        this.currentLyric.seek(this.curPlayTime*1000)
      }
    },
    bindSeekbar () {
      this.timer = setInterval(() => {
        this.curPlayTime = this.audio.currentTime
        if(this.curPlayTime === this.curSong.duration){
          clearInterval(this.timer)
        }
      }, 100)
      this.audio.addEventListener("ended", () => {
        switch(this.playerModel){
          case 0: (this.curSong.listIndex === (this.songList.length - 1))? this.playThis(this.songList[0], 0)  : this.nextPlay();break;
          case 1: (this.pausePlay(), this.audio.currentTime = 0, this.startPlay()); 
            if(this.currentLyric){
              this.currentLyric.seek(0)
            }
            break;
          case 2: this.pausePlay(); this.audio.currentTime = 0; let index = parseInt(Math.random()*(this.songList.length - 1));this.playThis(this.songList[index], index);break;
        }
      })
    },
    downCurSong () {
      if (confirm(`要开始下载 ${this.curSong.singer} - ${this.curSong.songName} 吗?`)) {
        this.$refs.download.href = this.curSong.songUrl
        this.$refs.download.click()
        this.songList[this.curSong.listIndex].isDown = true
      }
    },
    startPlay () {
      this.isPlaying = true
      this.bindSeekbar()
    },    
    pausePlay () {
      let playPromise = this.$refs.audio.play()
      if (playPromise !== undefined) {
        playPromise.then( () => {
          clearInterval(this.timer)
          this.isPlaying = false
        }).catch( (error) => {
          console.dir(error)
        })
      }
    },
    conPlay () {
      if(this.isPlaying){
        this.pausePlay()
      }else{
        this.startPlay()
      }
      if(this.currentLyric){
        this.currentLyric.togglePlay()
      }
    },
    changePlayerMode () {
      let curModel = this.playerModel
      let icon = ['repeat', 'repeat_one', 'shuffle']
      let text = ['列表循环', '单曲循环', '随机播放']
      if(curModel < 2){
        this.playerModel++        
      }else{
        this.playerModel = 0
      }
      this.playerModeIcon = icon[this.playerModel]
      this.openSnackbar(text[this.playerModel], 'bottom')
    },
    nextPlay () {
      let curIndex = this.curSong.listIndex
      if(curIndex < this.songList.length - 1 && this.playerModel != 2 ){
        this.playThis(this.songList[curIndex + 1], curIndex + 1)
      } else if (curIndex < this.songList.length - 1 && this.playerModel === 2 ) {
        let index = parseInt( Math.random() * (this.songList.length - 1) )
        this.playThis(this.songList[index], index)
      }
    },
    prevPlay () {
      let curIndex = this.curSong.listIndex
      if(curIndex > 0){
        this.playThis(this.songList[curIndex - 1], curIndex - 1)
      }else{
        this.openSnackbar('没有上一曲了', 'bottom')
      }
    },
    playSong (song, index) {
      let playPromise = this.$refs.audio.play()
      if (playPromise !== undefined) {
        this.pausePlay()
        playPromise.then( () => {
          let tempSong = {
            id: song.id,
            listIndex: index,
            imgSrc: song.artists[0].img1v1Url,
            songName: song.name,
            singer: song.artists[0].name,
            songUrl: song.songUrl,
            duration: song.duration/1000
          }
          this.curSong = tempSong
          this.audio.src = this.curSong.songUrl
        }).catch( (error) => {
          console.dir(error)
          if(error.code === 9){
            this.openSnackbar('无法播放此音乐','top')
            this.isPlaying = false
            this.audio.pause()
            clearInterval(this.timer)
          }
        })
      }   
    },
    openSnackbar (msg, pos) {
      this.snackbar.message = msg
      this.snackbar.position = pos
      if (this.snackbar.timer) clearTimeout(this.snackbar.timer);
      this.snackbar.open = true
      this.snackbar.timer = setTimeout(() => {
        this.snackbar.open = false
      }, this.snackbar.timeout)
    },    
    init () {
      axios.defaults.baseURL = `${this.HOST}:${this.PART}`      
      this.getAndParseLrc()
      this.getSongAlbum(this.songList[0])
      this.audio = this.$refs.audio
      this.audio.src = this.curSong.songUrl
      console.dir(this.audio)
      this.getHotSearch()
    },
    initSwiper () {
      let configSwiper = {
          pagination: '.swiper-pagination',
          paginationClickable: true,
          loop: false,
          speed: 600,
          autoplay: false,
          observer: true, //修改swiper自己或子元素时，自动初始化swiper
          observeParents: true, //修改swiper的父元素时，自动初始化swiper
          on: {
            slideChangeTransitionEnd () {
              document.querySelector(".player").scrollTop = 0
            }
          }
      }
      this.swiper = new Swiper('#xy-swiper-container', configSwiper)
    },
    getSongAlbum (song) {
      let config = {
        method: 'get',
        url: `/album?id=${song.album.id}`
      }      
      axios(config).then((rets) => {
        if(rets.data.code === 200){
          this.curSong.imgSrc = rets.data.album.picUrl
          this.curSongAlbum = rets.data.album
          if(!this.curSongAlbum.description){
            this.curSongAlbum.description = '😔 这个歌手很懒，什么都没有写'
          }
        }
      }).catch((rets) => {
        console.dir(rets);
      })     
    },
    getLRC () {
      this.currentLineNum = 0
      this.curSongLRCText = '寻找歌词中...'
      return new Promise((resolve, reject) => {
        axios({method: 'get', url: `/lyric?id=${this.curSong.id}`})
        .then((rets) => {
          if(rets.data){
            if(rets.data.nolyric){
              this.curSongLRCText = '纯音乐，请欣赏'
            }else{
              resolve(rets.data.lrc.lyric)
            }           
          }else{
            this.curSongLRCText = '未找到歌词'
          }         
        }).catch((rets) => {
          console.dir(rets)
          reject(rets)
        })
      })
    },
    getAndParseLrc () {
      this.getLRC().then((lyric) => {
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        if (this.isPlaying) {
          this.currentLyric.play()
        }
      })
    },
    handleLyric ({lineNum, txt}) {
      this.currentLineNum = lineNum
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5]        
        // this.$refs.lyricList.scrollToElement(lineEl, 1000)
        this.$refs.lyricList.$el.style.transform = `translate3d(0, -${this.$refs.lyricLine[lineNum - 5].offsetTop}px, 0px)`
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
    },
    // addchip (str) {
    //   if(localStorage.chips){
    //     let chips = JSON.parse(localStorage.chips)
    //     if(this.inArray(str, chips)){
    //       return
    //     }
    //     let newchips = chips.push(str)
    //     localStorage.chips = JSON.stringify(newchips)
    //   }else{
    //     localStorage.chips = JSON.stringify([str])
    //   }
    //   this.chips = JSON.parse(localStorage.chips)
    // },
    // deletechip (chip) {
    //   if(localStorage.chips){
    //     let chips = JSON.parse(localStorage.chips)
    //     for (let i = 0; i < chips.length; i++) {
    //       if (chips[i] === chip) {
    //         chips.splice(i, 1)
    //         i = i - 1
    //       }
    //     }
    //     localStorage.chips = JSON.stringify(chips)
    //   }
    //   this.chips = JSON.parse(localStorage.chips)
    // },
    // inArray (search, array) {
    //   for (let i in array) {
    //     if (array[i] === search) {
    //       return true
    //     }
    //   }
    //   return false
    // },
    playThis (song, index) {
      let config = {
        method: 'get',
        url: `/music/url?id=${song.id}`
      }
      this.songUrlGetting = true
      this.getSongAlbum(song)
      axios(config).then((rets) => {
        if(rets.data.code === 200 && rets.data.data[0].url != null){
          this.songUrlGetting = false
          song.songUrl = rets.data.data[0].url
          this.playSong(song, index)
        }else{
          this.songUrlGetting = false
          this.openSnackbar('很抱歉，没有该音乐版权','top')
        }
      }).catch((rets) => {
        this.songUrlGetting = false
        this.openSnackbar('检测到网络不稳定','top')
      })
    },
    getHotSearch () {
      let config = {
        method: 'get',
        url: `/search/hot`
      }
      axios(config).then((rets) => {
        if(rets.data.code === 200){
          this.hotSearch = rets.data.result.hots
        }
      }).catch((rets) => {
        console.dir(rets)
      })
    },
    searchSong () {
      console.dir(this.search)
      if(this.search.replace(/(^\s*)|(\s*$)/g, "") === ""){
        this.openSnackbar('请输入歌曲名或歌手名搜索','top')
        return
      }
      this.searchSongByStr(this.search)
    },
    searchSongByStr (str) {
      this.isSearch = true
      this.searching = true
      this.search = str
      let config = {
        method: 'get',
        url: `/search?keywords=${str}`
      }
      axios(config).then((rets) => {
        if(rets.data.code === 200){          
          this.searching = false
          this.songList = rets.data.result.songs
          for (let i = 0; i < this.songList.length; i++) {
            this.songList[i].isDown = false
            this.songList[i].isFav = false
          }
        }else{
          this.searching = false
          this.openSnackbar('没有搜错到结果','top')
        }
      }).catch((rets) => {
        this.searching = false
        this.openSnackbar('检测到网络不稳定','top')
      })
    }
  },
  components: {
    scroll: Scroll
  },
  watch: {
    curSong (newSong, oldSong) {
      if(newSong.id === oldSong.id){
        return
      }
      if(this.currentLyric){
        this.currentLyric.stop()
        this.$refs.lyricList.$el.style.transform = `translate3d(0, 0, 0px)`
      }
      this.$nextTick(() => {
        this.getAndParseLrc()
        this.startPlay()
      })
    },
    isPlaying (newState, oldState) {
      const audio = this.$refs.audio
      this.$nextTick(() => {
        newState ? audio.play() : audio.pause()
      })
    }    
  },
  mounted () {
    this.init()    
    this.initSwiper()
  },
  updated () {
    axios.defaults.baseURL = `${this.HOST}:${this.PART}`
  }
}
</script>

<style scoped>
.player{
  width: 100%;
  height: 100%;
  padding-bottom: 80px;
  overflow-x: hidden;
  overflow-y: scroll;
  padding-top: 56px;
}

.searchBar{
  width: 80%;
  height: 80px;
  line-height: 60px;
  text-align: center;
  margin: 20px auto auto auto;
  padding: 10px 20px;
  border-radius: 50px;
  transition: all 300ms;
}

.middleSearch{
  margin-top: 100px;
}

.searchBarActive{
  border-radius: 0;
  margin-top:0;
  width: 100%;
}

.controlButton{
  position: fixed;
  bottom: 90px;
  width: 100%;
  height: 60px;  
  margin: auto;
  transition: all 300ms;
  z-index: 10;
}

.controlButton button{
  margin: auto 5px;
}

.controlButtonActive{
  bottom: 28px;
  transform: scale(0.68);
}

.jsutHide{
  visibility:hidden;  
}

.hideYscroll{
  overflow-y: hidden;
}

.bottomPlayer{
  background: #fff;
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 80px;
  z-index: 1;
}

.LRCContainer{
  text-align: center;
}

.span{
  animation: rotating 9s linear infinite;
}

.spanquick{
   animation: rotating 500ms linear infinite; 
}

@keyframes rotating {
    from{
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -ms-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    to{
      -webkit-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -ms-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
}

.hotSearch{
  text-align: center;
}

.lyric-wrapper{
  transition: all 300ms;
}

.hotSearch .mu-button{
  margin: 5px;
}

.gohome{
  transform: translate3d(0px, 0px, 0px)!important;
}

.swiper-wrapper{
  cursor: pointer;
}
.current{
  color: #2196f3;
}
.borderCircle{
  border-radius: 30px!important;
}
</style>
