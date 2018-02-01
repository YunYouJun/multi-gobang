// Learn TypeScript:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/typescript/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Sprite)
    overSprite: cc.Sprite = null;

    @property(cc.Label)
    overLabel: cc.Label = null;

    // 棋子的预制资源
    @property(cc.Prefab)
    chessPrefab: cc.Prefab = null;

    //棋子节点的集合，用一维数组表示二维位置
    @property([cc.Node])
    public chessList: cc.Node[] = [];

    // 白棋图片
    @property(cc.SpriteFrame)
    whiteSpriteFrame: cc.SpriteFrame = null;

    // 黑棋图片
    @property(cc.SpriteFrame)
    blackSpriteFrame: cc.SpriteFrame = null;

    // 每一回合落下的棋子
    @property({
        type: cc.Node,
        visible: false
    })
    touchChess: cc.Node = null;

    @property
    gameState: any = "";

    @property([])
    fiveGroup: number[][] = []    //五元组

    @property([])
    fiveGroupScore: number[] = []   //五元组分数

    // LIFE-CYCLE CALLBACKS:

    // use this for initialization
    onLoad () {
        this.overSprite.node.active = false;//让结束画面位于屏幕外

        let self = this;
        //  初始化棋盘上225个棋子节点，并为每个节点添加事件
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 15; x++) {
                let newChess = cc.instantiate(this.chessPrefab); //  复制Chess预制资源
                this.node.addChild(newChess);
                //根据棋盘和棋子大小计算使每个棋子节点位于指定位置
                newChess.setPosition(cc.p(x * 40 + 20, y * 40 + 20)); 
                newChess.tag = y * 15 + x;   //根据每个节点的tag就可以算出其二维坐标
                newChess.on(cc.Node.EventType.TOUCH_END, function(event) {
                    self.touchChess = this;
                    if (self.gameState ===  'black' && this.getComponent(cc.Sprite).spriteFrame === null) {
                        this.getComponent(cc.Sprite).spriteFrame = self.blackSpriteFrame;   //下子后添加棋子图片使棋子显示
                        self.judgeOver();
                        if (self.gameState === "white") {
                            //延迟一秒电脑下棋
                            self.scheduleOnce(function() {
                                self.ai()
                            }, 0.5);
                        }
                    }
                });
                this.chessList.push(newChess);
            }
        }

        //开局白棋（电脑）在棋盘中央下一子
        this.chessList[112].getComponent(cc.Sprite).spriteFrame = self.whiteSpriteFrame;
        this.gameState = 'black';

        //添加五元数组
        //横向
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 11; x++) {
                this.fiveGroup.push([ y * 15 + x, y * 15 + x + 1, y * 15 + x + 2, y * 15 + x + 3, y * 15 + x + 4]);
            }  
        }
        //纵向
        for (let x = 0; x < 15; x++) {
            for (let y = 0; y < 11; y++) {
                this.fiveGroup.push([ y * 15 + x, (y + 1) * 15 + x, (y + 2) * 15 + x, (y + 3) * 15 + x, (y + 4) * 15 + x]);
            }
        }

        //右上斜向
        for (let b = -10; b <= 10; b++) {
            for (let x = 0; x < 11; x++) {
                if (b + x < 0 || b + x > 10) {
                    continue;
                } else {
                    this.fiveGroup.push([(b + x) * 15 + x, (b + x + 1) * 15 + x + 1, (b + x + 2) * 15 + x + 2, (b + x + 3) * 15 + x + 3, (b + x + 4) * 15 + x + 4]);
                }
            }
        }

        //右下斜向
        for (let b = 0; b <= 20; b++) {
            for(let y = 0; y < 11; y++) {
                if((b - y) < 4 || (b - y) > 14) {
                    continue;
                } else {
                    this.fiveGroup.push([y * 15 + (b - y), (y + 1) * 15 + (b - y - 1), (y + 2) * 15 + (b - y - 2), (y + 3) * 15 + (b - y - 3), (y + 4) * 15 + (b - y - 4)]);
                }
            }
        }
    }

    restartGame () {
        cc.director.loadScene("Game")
    }

    // 返回菜单
    toMenu () {
        cc.director.loadScene("Menu")
    }

    //电脑下棋逻辑
    ai () {
        //评分
        for (let i = 0; i < this.fiveGroup.length; i++) {
            let b = 0;  //五元组里黑棋的个数
            let w = 0;  //五元组里白棋的个数
            for (let j = 0; j < 5; j++) {
                if (this.chessList[this.fiveGroup[i][j]].getComponent(cc.Sprite).spriteFrame == this.blackSpriteFrame) {
                    b++;
                } else if (this.chessList[this.fiveGroup[i][j]].getComponent(cc.Sprite).spriteFrame == this.whiteSpriteFrame) {
                    w++;
                }
            }
            if (b + w == 0) {
                this.fiveGroupScore[i] = 7;
            } else if (b > 0 && w > 0) {
                this.fiveGroupScore[i] = 0;
            } else if (b == 0 && w == 1) {
                this.fiveGroupScore[i] = 35;
            } else if (b == 0 && w == 2) {
                this.fiveGroupScore[i] = 800;
            } else if (b == 0 && w == 3) {
                this.fiveGroupScore[i] = 15000;
            } else if (b == 0 && w == 4) {
                this.fiveGroupScore[i] = 800000;
            } else if( w == 0 && b == 1) {
                this.fiveGroupScore[i] = 15;
            } else if (w == 0 && b == 2 ) {
                this.fiveGroupScore[i] = 400;
            } else if (w == 0 && b == 3) {
                this.fiveGroupScore[i] = 1800;
            } else if (w == 0 && b == 4) {
                this.fiveGroupScore[i] = 100000;
            }
        }

        //  找最高分的五元组
        let hScore = 0;
        let mPosition = 0;
        for(let i = 0; i < this.fiveGroupScore.length; i++) {
            if (this.fiveGroupScore[i] > hScore) {
                hScore = this.fiveGroupScore[i];
                mPosition = i
            }
        }

        //  在最高分的五元组里找到最优下子位置
        let flag1 = false;//无子
        let flag2 = false;//有子
        let nPosition = 0;
        for(let i = 0; i < 5; i++) {
            if(!flag1 && this.chessList[this.fiveGroup[mPosition][i]].getComponent(cc.Sprite).spriteFrame == null) {
                nPosition = i;
            }
            if(!flag2 && this.chessList[this.fiveGroup[mPosition][i]].getComponent(cc.Sprite).spriteFrame != null) {
                flag1 = true;
                flag2 = true;
            }
            if(flag2 && this.chessList[this.fiveGroup[mPosition][i]].getComponent(cc.Sprite).spriteFrame == null) {
                nPosition = i;
                break;
            }
        }

        //在最最优位置下子
        this.chessList[this.fiveGroup[mPosition][nPosition]].getComponent(cc.Sprite).spriteFrame = this.whiteSpriteFrame;
        this.touchChess = this.chessList[this.fiveGroup[mPosition][nPosition]];
        this.judgeOver();
    }

    judgeOver () {
        let x0: number = this.touchChess.tag % 15;
        let y0: number = parseInt(this.touchChess.tag / 15);
        //判断横向
        let fiveCount = 0;
        for (let x = 0; x < 15; x++) {
            if((this.chessList[y0 * 15 + x].getComponent(cc.Sprite)).spriteFrame === this.touchChess.getComponent(cc.Sprite).spriteFrame){
                fiveCount++; 
                if (fiveCount == 5) {
                    if (this.gameState === 'black') {
                        this.overLabel.string = "你赢了";
                        this.overSprite.node.active = true;
                    } else {
                        this.overLabel.string = "你输了";
                        this.overSprite.node.active = true;
                    }
                    this.gameState = 'over';
                    return;
                }
            } else {
                fiveCount = 0;
            }
        }
        //判断纵向
        fiveCount = 0;
        for (let y = 0; y < 15; y++) {
            if((this.chessList[y*15+x0].getComponent(cc.Sprite)).spriteFrame === this.touchChess.getComponent(cc.Sprite).spriteFrame){
                fiveCount++; 
                if(fiveCount==5){
                    if(this.gameState === 'black'){
                        this.overLabel.string = "你赢了";
                        this.overSprite.node.active = true;
                    }else{
                        this.overLabel.string = "你输了";
                        this.overSprite.node.active = true;
                    }
                    this.gameState = 'over';
                    return;
                }
            }else{
                fiveCount=0;
            }
        }
        //判断右上斜向
        let f = y0 - x0;
        fiveCount = 0;
        for(let x = 0;x < 15;x++){
            if(f+x < 0 || f+x > 14){
                continue;
            }
            if((this.chessList[(f+x)*15+x].getComponent(cc.Sprite)).spriteFrame === this.touchChess.getComponent(cc.Sprite).spriteFrame){
                fiveCount++; 
                if(fiveCount==5){
                    if(this.gameState === 'black'){
                        this.overLabel.string = "你赢了";
                        this.overSprite.node.active = true;
                    }else{
                        this.overLabel.string = "你输了";
                        this.overSprite.node.active = true;
                    }
                    this.gameState = 'over';
                    return;
                }
            }else{
                fiveCount=0;
            }
        }
        //判断右下斜向
        f = y0 + x0;
        fiveCount = 0;
        for(let x = 0;x < 15;x++){
            if(f-x < 0 || f-x > 14){
                continue;
            }
            if((this.chessList[(f-x)*15+x].getComponent(cc.Sprite)).spriteFrame === this.touchChess.getComponent(cc.Sprite).spriteFrame){
                fiveCount++; 
                if(fiveCount==5){
                    if(this.gameState === 'black'){
                        this.overLabel.string = "你赢了";
                        this.overSprite.node.active = true;
                    }else{
                        this.overLabel.string = "你输了";
                        this.overSprite.node.active = true;
                    }
                    this.gameState = 'over';
                    return;
                }
            }else{
                fiveCount=0;
            }
        }
        //没有输赢交换下子顺序
        if(this.gameState === 'black'){
            this.gameState = 'white';
        }else{
            this.gameState = 'black';
        }
    }


    // update (dt) {},
}
