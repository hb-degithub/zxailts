<template>
  <el-dialog
    v-model="visible"
    title=""
    width="680px"
    :close-on-click-modal="false"
    :show-close="true"
    class="welcome-dialog"
    align-center
    destroy-on-close
  >
    <template #header>
      <div class="dialog-header">
        <div class="header-brand">
          <div class="brand-icon">💬</div>
          <div class="brand-text">
            <h2>专业导引聊天室</h2>
            <p>欢迎加入我们的 AI 智能聊天社区</p>
          </div>
        </div>
        <div class="header-progress">
          <div class="progress-steps">
            <div
              v-for="(step, index) in progressSteps"
              :key="index"
              :class="['step', { active: currentStep >= index, current: currentStep === index }]"
              @click="currentStep = index"
            >
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-label">{{ step }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="welcome-content">
      <!-- 步骤 1: 欢迎与须知 -->
      <div v-show="currentStep === 0" class="step-content">
        <div class="welcome-hero">
          <div class="hero-illustration">🚀</div>
          <h3>开始探索 AI 聊天新体验</h3>
          <p>在开始之前，请花费几分钟阅读以下重要信息，它们将帮助您更好地使用我们的服务</p>
        </div>

        <div class="info-cards">
          <div class="info-card safety">
            <div class="card-icon">🛡️</div>
            <div class="card-content">
              <h4>安全第一</h4>
              <p>保护您的账户安全，不要与他人共享密码或验证码</p>
            </div>
          </div>
          <div class="info-card ai">
            <div class="card-icon">🤖</div>
            <div class="card-content">
              <h4>AI 局限性</h4>
              <p>AI 可能产生错误信息，重要决策请咨询专业人士</p>
            </div>
          </div>
          <div class="info-card community">
            <div class="card-icon">🤝</div>
            <div class="card-content">
              <h4>文明交流</h4>
              <p>尊重其他用户，维护良好的聊天环境</p>
            </div>
          </div>
          <div class="info-card responsibility">
            <div class="card-icon">📋</div>
            <div class="card-content">
              <h4>用户责任</h4>
              <p>您对账户下所有活动负责，请遵守当地法律法规</p>
            </div>
          </div>
        </div>

        <div class="quick-tips">
          <h4><span class="tips-icon">💡</span> 快速提示</h4>
          <ul>
            <li>使用 <code>@机器人名</code> 可以直接召唤特定的 AI 机器人</li>
            <li>可以同时添加多个机器人，每个机器人有独立的性格和上下文</li>
            <li>重要信息请自行备份，聊天记录保留期限为 30 天</li>
            <li>发现违规内容？点击消息旁边的 "举报" 按钮反馈</li>
          </ul>
        </div>
      </div>

      <!-- 步骤 2: 重要注意事项 -->
      <div v-show="currentStep === 1" class="step-content">
        <div class="section-header">
          <div class="section-icon warning">⚠️</div>
          <div class="section-title">
            <h3>重要注意事项</h3>
            <p>请务必仔细阅读，这些事项关乎您的权益和安全</p>
          </div>
        </div>

        <div class="notice-grid">
          <div class="notice-item danger">
            <div class="notice-icon">🚨</div>
            <div class="notice-body">
              <h4>谨防诈骗</h4>
              <p>官方绝不会通过聊天方式索要您的验证码、账户密码或要求转账。如遇可疑情况，请立即举报。</p>
            </div>
          </div>
          <div class="notice-item warning">
            <div class="notice-icon">🤖</div>
            <div class="notice-body">
              <h4>AI 局限性声明</h4>
              <p>AI 可能产生看似合理但实际错误的"幻觉"信息。对于医疗、法律、金融、投资等重要决策，请务必咨询持牌专业人士。</p>
            </div>
          </div>
          <div class="notice-item info">
            <div class="notice-icon">📢</div>
            <div class="notice-body">
              <h4>内容合规</h4>
              <p>严禁发布违法内容，包括但不限于：色情低俗、赌博毒品、暴力恐怖、政治敏感、军事机密、邪教迷信等。</p>
            </div>
          </div>
          <div class="notice-item primary">
            <div class="notice-icon">⚖️</div>
            <div class="notice-body">
              <h4>行为规范</h4>
              <p>禁止人身攻击、侮辱谩骂、散布谣言、恶意刷屏、骚扰他人等行为。违规者将被警告、禁言甚至封禁账户。</p>
            </div>
          </div>
          <div class="notice-item success">
            <div class="notice-icon">💰</div>
            <div class="notice-body">
              <h4>财产安全</h4>
              <p>请勿与陌生人进行金钱往来。本平台不对用户间的私人交易行为负责，如发生财产损失由用户自行承担。</p>
            </div>
          </div>
          <div class="notice-item purple">
            <div class="notice-icon">⏱️</div>
            <div class="notice-body">
              <h4>使用限制</h4>
              <p>AI 回复存在延迟和不确定性，请耐心等待，切勿重复发送相同消息刷屏。对于高频使用者，平台有权实施限额措施。</p>
            </div>
          </div>
        </div>

        <div class="security-tips">
          <h4><span class="icon">🔐</span> 账户安全建议</h4>
          <div class="tips-row">
            <div class="tip-item">
              <span class="tip-icon">✓</span>
              <span>使用强密码（8位以上，包含大小写字母、数字、特殊字符）</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">✓</span>
              <span>定期更换密码，不在多个网站使用相同密码</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">✓</span>
              <span>不在公共设备上保存登录状态</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">✓</span>
              <span>开启设备锁屏密码，双重保护账户安全</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤 3: 用户协议 -->
      <div v-show="currentStep === 2" class="step-content">
        <div class="section-header">
          <div class="section-icon">📜</div>
          <div class="section-title">
            <h3>用户协议</h3>
            <p>使用本服务即表示您同意遵守以下条款</p>
          </div>
        </div>

        <el-tabs v-model="agreementTab" class="agreement-tabs">
          <el-tab-pane label="总则" name="general">
            <div class="agreement-block">
              <h4>一、服务条款的确认和接受</h4>
              <p>欢迎您使用专业导引聊天室（以下简称"本服务"）。在使用本服务前，请您务必仔细阅读并理解本协议的全部条款。如果您不同意本协议的任何内容，请不要注册或使用本服务。您注册、使用本服务即表示您已充分阅读、理解并同意接受本协议的全部条款。</p>

              <div class="version-info">
                <span>版本号：v1.0.0</span>
                <span>发布日期：2026年4月13日</span>
                <span>生效日期：2026年4月20日</span>
              </div>
            </div>

            <div class="agreement-block">
              <h4>二、服务内容说明</h4>
              <p>本服务为 AI 智能聊天平台，通过人工智能技术为用户提供对话交互服务。本服务包括但不限于：</p>
              <ul>
                <li>多聊天室创建与管理功能</li>
                <li>AI 机器人对话服务（支持多个机器人同时运行）</li>
                <li>用户间即时消息传递</li>
                <li>AI 模型配置与管理</li>
                <li>消息举报与审核系统</li>
                <li>用户个人中心与设置</li>
              </ul>
              <p class="note">本服务保留随时修改、中断或终止部分或全部服务的权利，恕不另行通知。</p>
            </div>

            <div class="agreement-block">
              <h4>三、用户注册与账户安全</h4>
              <p>用户注册需要提供真实的个人信息，并设置安全的账户密码。用户承诺：</p>
              <ul>
                <li>注册信息真实、准确、完整，不得冒充他人或使用虚假信息</li>
                <li>妥善保管账户密码，不得转让、出借或与他人共享账户</li>
                <li>发现账户被盗用或存在安全漏洞时立即通知我们</li>
                <li>用户账户仅限本人使用，禁止转让、出售或出租</li>
              </ul>
            </div>

            <div class="agreement-block">
              <h4>四、未成年人使用条款</h4>
              <div class="highlight-box">
                <span class="highlight-icon">👶</span>
                <p><strong>年龄限制：</strong>本服务仅向年满 18 周岁的成年人开放。如您未满 18 周岁，请在监护人的陪同下阅读本协议，并在监护人的同意和指导下使用本服务。</p>
              </div>
              <ul>
                <li>未满 18 周岁的用户在使用本服务时的一切行为，由其监护人承担全部责任</li>
                <li>监护人应履行监督义务，防止未成年人利用本服务接触不适宜的内容</li>
                <li>如发现未成年人使用了本服务，我们有权在核实后终止服务</li>
              </ul>
            </div>
          </el-tab-pane>

          <el-tab-pane label="行为规范" name="conduct">
            <div class="agreement-block">
              <h4>五、用户行为规范</h4>
              <p>用户承诺在使用本服务时遵守中华人民共和国相关法律法规，并对使用本服务期间的所有行为负责。</p>
              <p><strong>用户承诺不对本服务从事以下行为：</strong></p>
              <div class="prohibited-list">
                <div class="prohibited-item">
                  <span class="prohibited-icon">🚫</span>
                  <span>发布违反法律法规、公序良俗、社会道德的内容</span>
                </div>
                <div class="prohibited-item">
                  <span class="prohibited-icon">🚫</span>
                  <span>侵害他人名誉权、肖像权、隐私权、知识产权等人身权益和财产权益</span>
                </div>
                <div class="prohibited-item">
                  <span class="prohibited-icon">🚫</span>
                  <span>传播垃圾广告、欺诈信息、恶意软件、钓鱼链接</span>
                </div>
                <div class="prohibited-item">
                  <span class="prohibited-icon">🚫</span>
                  <span>尝试入侵、破解、破坏本服务系统或网络的安全性</span>
                </div>
                <div class="prohibited-item">
                  <span class="prohibited-icon">🚫</span>
                  <span>未经授权访问他人账户或尝试获取他人信息</span>
                </div>
                <div class="prohibited-item">
                  <span class="prohibited-icon">🚫</span>
                  <span>利用本服务从事任何形式的赌博、非法集资、诈骗等违法活动</span>
                </div>
                <div class="prohibited-item">
                  <span class="prohibited-icon">🚫</span>
                  <span>发布色情低俗、血腥暴力、恐怖主义、政治敏感等内容</span>
                </div>
                <div class="prohibited-item">
                  <span class="prohibited-icon">🚫</span>
                  <span>骚扰、侮辱、诽谤、威胁其他用户</span>
                </div>
                <div class="prohibited-item">
                  <span class="prohibited-icon">🚫</span>
                  <span>干扰本服务正常运行或影响其他用户正常使用</span>
                </div>
                <div class="prohibited-item">
                  <span class="prohibited-icon">🚫</span>
                  <span>重复发送相同消息刷屏，导致其他用户无法正常使用</span>
                </div>
              </div>
            </div>

            <div class="agreement-block">
              <h4>六、账户处罚与终止</h4>
              <p>如用户违反本协议或相关法律法规，本平台有权采取以下措施：</p>
              <div class="penalty-levels">
                <div class="penalty-level">
                  <span class="level-badge warning">一级</span>
                  <span>警告并要求纠正违规行为</span>
                </div>
                <div class="penalty-level">
                  <span class="level-badge danger">二级</span>
                  <span>暂时限制部分功能权限（禁言 1-7 天）</span>
                </div>
                <div class="penalty-level">
                  <span class="level-badge serious">三级</span>
                  <span>永久限制功能使用或禁止登录</span>
                </div>
                <div class="penalty-level">
                  <span class="level-badge critical">四级</span>
                  <span>移交相关部门追究法律责任</span>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="AI 服务" name="ai">
            <div class="agreement-block">
              <h4>七、AI 服务特别说明</h4>
              <div class="ai-warning-box">
                <span class="warning-icon">⚠️</span>
                <div>
                  <p><strong>由于 AI 技术及大语言模型的固有特性，用户在使用 AI 对话功能时特别需要注意以下事项：</strong></p>
                </div>
              </div>
              <ul>
                <li>AI 回复由人工智能自动生成，可能存在不准确、不完整、带有偏见或产生"幻觉"（生成看似合理但实际错误的信息）的情况</li>
                <li>AI 不能替代专业人士的建议，对于医疗、法律、金融、投资等重要决策，请务必咨询相关领域的持牌专业人士</li>
                <li>本平台不对 AI 生成内容的准确性、完整性、及时性做任何明示或暗示的保证</li>
                <li>用户应对 AI 回复保持批判性思维，合理判断和使用 AI 生成的内容</li>
                <li>因使用 AI 回复而产生的一切后果（包括但不限于决策失误、财产损失等），由用户自行承担</li>
              </ul>
            </div>

            <div class="agreement-block">
              <h4>八、第三方 AI 服务</h4>
              <p>本服务中的 AI 对话功能通过调用第三方大语言模型 API 实现，包括但不限于 OpenAI、Claude 等服务提供商。</p>
              <ul>
                <li>您的聊天内容（去除个人身份信息后）可能被用于改善第三方 AI 模型服务质量</li>
                <li>第三方 AI 服务提供商可能根据其隐私政策处理您的数据</li>
                <li>我们不对第三方 AI 服务提供商的可用性、稳定性做任何保证</li>
                <li>如第三方 AI 服务发生重大变更或停止，我们将提前通知用户并寻找替代方案</li>
              </ul>
            </div>

            <div class="agreement-block">
              <h4>九、AI 使用限制与额度</h4>
              <p>为保证服务质量和稳定性，我们对 AI 使用实施以下限制：</p>
              <div class="quota-info">
                <div class="quota-item">
                  <span class="quota-label">每日消息限额</span>
                  <span class="quota-value">100 条/用户/天</span>
                </div>
                <div class="quota-item">
                  <span class="quota-label">单次回复最大长度</span>
                  <span class="quota-value">4096 tokens</span>
                </div>
                <div class="quota-item">
                  <span class="quota-label">上下文保留</span>
                  <span class="quota-value">最近 10 条对话</span>
                </div>
                <div class="quota-item">
                  <span class="quota-label">聊天记录保留</span>
                  <span class="quota-value">30 天</span>
                </div>
              </div>
              <p class="note">以上限额为默认值，管理员可根据用户等级调整。超额使用可能导致服务暂时受限。</p>
            </div>

            <div class="agreement-block">
              <h4>十、消息内容审核</h4>
              <p>为维护平台安全和良好的聊天环境，我们采用以下内容审核机制：</p>
              <ul>
                <li><strong>AI 自动审核：</strong>使用 AI 技术对消息内容进行实时检测，识别违规内容</li>
                <li><strong>人工审核：</strong>对被举报的内容、敏感时段或可疑行为进行人工复查</li>
                <li><strong>关键词过滤：</strong>基于预设规则和机器学习模型进行实时过滤</li>
                <li><strong>用户举报：</strong>用户可通过举报功能反馈违规内容</li>
              </ul>
              <p>被判定为违规的消息将被自动拦截或删除，发送者将收到警告通知。严重违规者将被永久封禁账户。</p>
            </div>
          </el-tab-pane>

          <el-tab-pane label="法律条款" name="legal">
            <div class="agreement-block">
              <h4>十一、知识产权说明</h4>
              <p>本服务的外观设计、界面布局、代码架构等知识产权归本平台所有。用户在使用本服务时发表、传输的任何内容（包括但不限于文字、图片、音频、视频），其知识产权归用户本人所有，但用户授予本平台一项全球范围内、非独占、可转让、可再授权的商业性使用许可，用于改善服务和进行合理使用。</p>
            </div>

            <div class="agreement-block">
              <h4>十二、免责声明</h4>
              <p>在适用法律允许的最大范围内，本平台不对以下情况承担责任：</p>
              <ul>
                <li>因用户自身原因导致的任何直接或间接损失</li>
                <li>因不可抗力（包括但不限于自然灾害、战争、政府行为等）导致的服务中断或数据丢失</li>
                <li>因第三方原因（包括但不限于网络服务商、硬件故障等）导致的服务异常</li>
                <li>用户因依赖 AI 生成内容而做出的任何决策及其后果</li>
                <li>因用户违反本协议或法律法规导致的任何法律责任</li>
              </ul>
              <p>我们保留随时修改或中断服务而不通知用户的权利，但会尽力提前通知用户。</p>
            </div>

            <div class="agreement-block">
              <h4>十三、协议修改</h4>
              <p>本平台保留随时修改本协议的权利。协议修改后，本服务将会在显著位置公告修改内容，修改后的协议自公告期满之日起生效。用户继续使用本服务即表示接受修改后的协议。如用户不同意修改，有权停止使用本服务。</p>
            </div>

            <div class="agreement-block">
              <h4>十四、争议解决</h4>
              <p>本协议的订立、执行和解释均适用中华人民共和国法律。用户与本平台就本协议内容或本服务的使用发生任何争议，双方应首先友好协商解决；协商不成的，任何一方均可向本平台注册地有管辖权的人民法院提起诉讼。</p>
            </div>

            <div class="agreement-block">
              <h4>十五、其他规定</h4>
              <p>本协议构成用户与本平台之间关于使用本服务的完整协议，取代双方此前就同一事项达成的所有口头或书面的约定。本协议某一条款无效不影响其他条款的效力。如本协议的任何条款被认定为无效或不可执行，该条款应被修改为有效且可执行的条款，以实现原条款的意图。</p>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 步骤 4: 隐私政策 -->
      <div v-show="currentStep === 3" class="step-content">
        <div class="section-header">
          <div class="section-icon privacy">🔒</div>
          <div class="section-title">
            <h3>隐私政策</h3>
            <p>我们承诺保护您的个人隐私和数据安全</p>
          </div>
        </div>

        <el-tabs v-model="privacyTab" class="privacy-tabs">
          <el-tab-pane label="信息收集" name="collection">
            <div class="privacy-section">
              <h4>我们收集的信息</h4>
              <div class="data-cards">
                <div class="data-card">
                  <div class="data-icon">👤</div>
                  <h5>账户信息</h5>
                  <p>用户名、密码（加密存储）、头像、注册时间</p>
                  <span class="data-purpose">用于身份识别和账户管理</span>
                </div>
                <div class="data-card">
                  <div class="data-icon">💬</div>
                  <h5>聊天内容</h5>
                  <p>您发送的消息和 AI 回复</p>
                  <span class="data-purpose">用于提供对话服务和 AI 上下文</span>
                </div>
                <div class="data-card">
                  <div class="data-icon">📊</div>
                  <h5>使用日志</h5>
                  <p>访问时间、功能使用情况、IP 地址</p>
                  <span class="data-purpose">用于服务优化和安全分析</span>
                </div>
                <div class="data-card">
                  <div class="data-icon">📱</div>
                  <h5>设备信息</h5>
                  <p>浏览器类型、操作系统、设备标识</p>
                  <span class="data-purpose">用于兼容性优化和安全监测</span>
                </div>
              </div>
            </div>

            <div class="privacy-section">
              <h4>Cookie 使用</h4>
              <div class="cookie-types">
                <div class="cookie-item">
                  <span class="cookie-badge necessary">必要</span>
                  <div class="cookie-info">
                    <strong>必要 Cookie</strong>
                    <p>用于维持登录状态、记住偏好设置，保障服务基本功能</p>
                  </div>
                </div>
                <div class="cookie-item">
                  <span class="cookie-badge analytics">分析</span>
                  <div class="cookie-info">
                    <strong>分析 Cookie</strong>
                    <p>用于了解用户使用习惯，优化服务体验</p>
                  </div>
                </div>
                <div class="cookie-item">
                  <span class="cookie-badge marketing">营销</span>
                  <div class="cookie-info">
                    <strong>营销 Cookie</strong>
                    <p>可能用于展示相关广告（若有）</p>
                  </div>
                </div>
              </div>
              <p class="cookie-note">您可以通过浏览器设置拒绝或管理 Cookie，但可能影响部分功能使用。</p>
            </div>
          </el-tab-pane>

          <el-tab-pane label="信息使用" name="usage">
            <div class="privacy-section">
              <h4>我们如何使用您的信息</h4>
              <div class="usage-grid">
                <div class="usage-item">
                  <div class="usage-icon">⚙️</div>
                  <h5>服务运行</h5>
                  <p>提供、维护和改进我们的服务</p>
                </div>
                <div class="usage-item">
                  <div class="usage-icon">💬</div>
                  <h5>消息处理</h5>
                  <p>处理您的消息和请求</p>
                </div>
                <div class="usage-item">
                  <div class="usage-icon">🔔</div>
                  <h5>服务通知</h5>
                  <p>向您推送服务通知和更新</p>
                </div>
                <div class="usage-item">
                  <div class="usage-icon">🔒</div>
                  <h5>安全保障</h5>
                  <p>检测和防止安全威胁、欺诈和滥用</p>
                </div>
                <div class="usage-item">
                  <div class="usage-icon">⚖️</div>
                  <h5>法律合规</h5>
                  <p>遵守法律法规的要求</p>
                </div>
                <div class="usage-item">
                  <div class="usage-icon">🤖</div>
                  <h5>AI 服务</h5>
                  <p>向 AI 模型发送对话内容以生成回复</p>
                </div>
              </div>
            </div>

            <div class="privacy-section">
              <h4>信息共享</h4>
              <p>我们承诺不会将您的个人信息出售给任何第三方。在以下情况下，我们可能共享您的信息：</p>
              <div class="share-scenarios">
                <div class="share-item">
                  <span class="share-icon">🏢</span>
                  <div class="share-content">
                    <strong>服务提供商</strong>
                    <p>向帮助我们运营服务的第三方供应商（如云服务、AI API 提供商）提供必要信息</p>
                  </div>
                </div>
                <div class="share-item">
                  <span class="share-icon">⚖️</span>
                  <div class="share-content">
                    <strong>法律要求</strong>
                    <p>根据法律法规、法院命令或政府要求披露</p>
                  </div>
                </div>
                <div class="share-item">
                  <span class="share-icon">🛡️</span>
                  <div class="share-content">
                    <strong>保护权益</strong>
                    <p>为保护本平台或其他用户的权利、财产或安全</p>
                  </div>
                </div>
                <div class="share-item">
                  <span class="share-icon">📈</span>
                  <div class="share-content">
                    <strong>业务转让</strong>
                    <p>如发生合并、收购或资产出售，您的信息可能随之转移</p>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="数据安全" name="security">
            <div class="privacy-section">
              <h4>信息保护措施</h4>
              <div class="security-measures">
                <div class="measure-item">
                  <div class="measure-icon">🔐</div>
                  <div class="measure-text">
                    <strong>HTTPS 加密传输</strong>
                    <p>所有数据传输采用 TLS/SSL 加密</p>
                  </div>
                </div>
                <div class="measure-item">
                  <div class="measure-icon">🔑</div>
                  <div class="measure-text">
                    <strong>密码加密存储</strong>
                    <p>采用 BCrypt 等强哈希算法</p>
                  </div>
                </div>
                <div class="measure-item">
                  <div class="measure-icon">🔐</div>
                  <div class="measure-text">
                    <strong>敏感操作二次验证</strong>
                    <p>关键操作需要额外身份验证</p>
                  </div>
                </div>
                <div class="measure-item">
                  <div class="measure-icon">🔍</div>
                  <div class="measure-text">
                    <strong>定期安全审计</strong>
                    <p>定期进行漏洞扫描和安全评估</p>
                  </div>
                </div>
                <div class="measure-item">
                  <div class="measure-icon">👥</div>
                  <div class="measure-text">
                    <strong>权限访问控制</strong>
                    <p>严格限制员工访问用户数据的权限</p>
                  </div>
                </div>
                <div class="measure-item">
                  <div class="measure-icon">💾</div>
                  <div class="measure-text">
                    <strong>数据备份</strong>
                    <p>定期备份，数据中心物理安全保障</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="privacy-section">
              <h4>数据保留期限</h4>
              <div class="retention-table">
                <div class="retention-row">
                  <span class="retention-type">账户信息</span>
                  <span class="retention-period">保留至账户注销后 30 天</span>
                </div>
                <div class="retention-row">
                  <span class="retention-type">聊天记录</span>
                  <span class="retention-period">保留 30 天后自动清除</span>
                </div>
                <div class="retention-row">
                  <span class="retention-type">操作日志</span>
                  <span class="retention-period">保留 90 天</span>
                </div>
                <div class="retention-row">
                  <span class="retention-type">法律法规要求记录</span>
                  <span class="retention-period">保留不少于 5 年</span>
                </div>
              </div>
              <p class="note">超出保留期限的数据将被安全删除，无法恢复。</p>
            </div>

            <div class="privacy-section">
              <h4>您的权利</h4>
              <div class="rights-grid">
                <div class="right-item">
                  <span class="right-icon">👁️</span>
                  <strong>访问权</strong>
                  <p>您可以查看您的账户信息和聊天记录</p>
                </div>
                <div class="right-item">
                  <span class="right-icon">✏️</span>
                  <strong>更正权</strong>
                  <p>您可以更正不准确的个人信息</p>
                </div>
                <div class="right-item">
                  <span class="right-icon">🗑️</span>
                  <strong>删除权</strong>
                  <p>您可以申请注销账户删除您的个人信息</p>
                </div>
                <div class="right-item">
                  <span class="right-icon">🚫</span>
                  <strong>撤回同意</strong>
                  <p>您可以撤回对 Cookie 使用的同意</p>
                </div>
                <div class="right-item">
                  <span class="right-icon">📝</span>
                  <strong>投诉权</strong>
                  <p>如认为侵权可向相关监管机构投诉</p>
                </div>
                <div class="right-item">
                  <span class="right-icon">📤</span>
                  <strong>数据可携</strong>
                  <p>您可以导出您的聊天记录数据</p>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="儿童与更新" name="children">
            <div class="privacy-section">
              <h4>儿童隐私保护</h4>
              <div class="children-warning">
                <span class="warning-icon">👶</span>
                <div>
                  <p>我们非常重视对儿童隐私的保护。<strong>本服务不面向未满 14 周岁的儿童</strong>，也不故意收集儿童的个人信息。</p>
                  <p>如果我们发现收集了儿童的信息，将立即删除。如果您认为我们收集了儿童信息，请立即联系我们。</p>
                </div>
              </div>
            </div>

            <div class="privacy-section">
              <h4>政策更新</h4>
              <p>我们可能会不时更新本隐私政策。重大变更时，我们将通过以下方式通知您：</p>
              <ul>
                <li>应用内显著位置公告</li>
                <li>发送邮件通知</li>
                <li>弹窗提醒（下次登录时）</li>
              </ul>
              <p>继续使用本服务即表示您接受更新后的隐私政策。</p>
            </div>

            <div class="privacy-section">
              <h4>联系我们</h4>
              <p>如您对本隐私政策有任何疑问、意见或建议，可通过以下方式联系我们：</p>
              <div class="contact-methods">
                <div class="contact-item">
                  <span class="contact-icon">💬</span>
                  <div class="contact-info">
                    <strong>官方客服群</strong>
                    <p>请在应用内获取最新群组信息</p>
                  </div>
                </div>
                <div class="contact-item">
                  <span class="contact-icon">📧</span>
                  <div class="contact-info">
                    <strong>意见反馈</strong>
                    <p>可通过应用内"意见反馈"功能提交</p>
                  </div>
                </div>
                <div class="contact-item">
                  <span class="contact-icon">💼</span>
                  <div class="contact-info">
                    <strong>商务合作</strong>
                    <p>如有商务合作意向，请发送邮件至官方邮箱</p>
                  </div>
                </div>
              </div>
              <p class="note">我们将在 3 个工作日内回复您的邮件。如有紧急事项，请通过客服群联系我们。</p>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 步骤 5: 加入社区 -->
      <div v-show="currentStep === 4" class="step-content">
        <div class="section-header">
          <div class="section-icon community">🏘️</div>
          <div class="section-title">
            <h3>加入聊天社区</h3>
            <p>加入我们的社区，获得更多帮助和支持</p>
          </div>
        </div>

        <div class="community-intro">
          <div class="intro-icon">👋</div>
          <div class="intro-text">
            <h4>欢迎成为社区的一员！</h4>
            <p>加入我们的社区，与其他用户交流心得，获取最新更新，参与活动讨论</p>
          </div>
        </div>

        <div class="community-benefits">
          <h4><span class="icon">🎁</span> 社区福利</h4>
          <div class="benefits-grid">
            <div class="benefit-item">
              <div class="benefit-icon">💬</div>
              <div class="benefit-content">
                <strong>交流心得</strong>
                <p>与其他用户分享使用经验，探讨 AI 技术</p>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">🎯</div>
              <div class="benefit-content">
                <strong>获取帮助</strong>
                <p>遇到问题？社区成员和管理员会热心帮助</p>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">🆕</div>
              <div class="benefit-content">
                <strong>最新资讯</strong>
                <p>第一时间获取功能更新、活动公告</p>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">🎉</div>
              <div class="benefit-content">
                <strong>参与活动</strong>
                <p>不定期举办抽奖、讨论、创作等活动</p>
              </div>
            </div>
          </div>
        </div>

        <div class="community-channels">
          <h4><span class="icon">📢</span> 社区频道</h4>
          <div class="channels-list">
            <div class="channel-item">
              <div class="channel-icon official">📢</div>
              <div class="channel-content">
                <strong>官方公告</strong>
                <p>功能更新、维护通知、活动公告</p>
              </div>
              <el-tag type="success" size="small">官方</el-tag>
            </div>
            <div class="channel-item">
              <div class="channel-icon">💬</div>
              <div class="channel-content">
                <strong>综合讨论</strong>
                <p>日常聊天、功能建议、问题反馈</p>
              </div>
              <el-tag size="small">推荐</el-tag>
            </div>
            <div class="channel-item">
              <div class="channel-icon">🤖</div>
              <div class="channel-content">
                <strong>AI 技巧</strong>
                <p>分享 AI 使用技巧、提示词工程</p>
              </div>
              <el-tag size="small">热门</el-tag>
            </div>
            <div class="channel-item">
              <div class="channel-icon">🐛</div>
              <div class="channel-content">
                <strong>反馈建议</strong>
                <p>提交 bug、功能建议、改进意见</p>
              </div>
              <el-tag type="warning" size="small">反馈</el-tag>
            </div>
            <div class="channel-item">
              <div class="channel-icon">🎨</div>
              <div class="channel-content">
                <strong>创意分享</strong>
                <p>分享你与 AI 的有趣对话、创作成果</p>
              </div>
              <el-tag size="small">活跃</el-tag>
            </div>
          </div>
        </div>

        <div class="community-rules">
          <h4><span class="icon">📋</span> 社区规范</h4>
          <div class="rules-grid">
            <div class="rule-item allowed">
              <span class="rule-icon">✅</span>
              <div class="rule-content">
                <strong>鼓励行为</strong>
                <p>友善交流、分享经验、帮助他人、积极反馈</p>
              </div>
            </div>
            <div class="rule-item prohibited">
              <span class="rule-icon">❌</span>
              <div class="rule-content">
                <strong>禁止行为</strong>
                <p>人身攻击、垃圾广告、政治敏感、违规内容</p>
              </div>
            </div>
          </div>
        </div>

        <div class="join-community">
          <div class="join-card">
            <div class="join-qr">
              <div class="qr-placeholder">📱</div>
              <p>扫码加入</p>
            </div>
            <div class="join-links">
              <h5>快速加入</h5>
              <div class="link-item">
                <span class="link-icon">💬</span>
                <span class="link-text">官方客服群</span>
                <el-button size="small" type="primary" plain>加入</el-button>
              </div>
              <div class="link-item">
                <span class="link-icon">📱</span>
                <span class="link-text">微信粉丝群</span>
                <el-button size="small" type="primary" plain>加入</el-button>
              </div>
              <div class="link-item">
                <span class="link-icon">🌐</span>
                <span class="link-text">官方网站</span>
                <el-button size="small" type="primary" plain>访问</el-button>
              </div>
            </div>
          </div>
          <p class="join-note">入群请备注用户名，管理员有权审核入群申请</p>
        </div>
      </div>

      <!-- 步骤 6: 最终确认 -->
      <div v-show="currentStep === 5" class="step-content">
        <div class="confirm-section">
          <div class="confirm-hero">
            <div class="hero-icon">✅</div>
            <h3>即将开始使用</h3>
            <p>请确认您已阅读并理解上述所有内容</p>
          </div>

          <div class="confirm-checklist">
            <div class="checklist-item">
              <div class="checklist-icon read">📖</div>
              <div class="checklist-content">
                <strong>我已阅读注意事项</strong>
                <p>了解 AI 局限性、安全提示、行为规范等重要信息</p>
              </div>
            </div>
            <div class="checklist-item">
              <div class="checklist-icon protocol">📋</div>
              <div class="checklist-content">
                <strong>我理解用户协议</strong>
                <p>同意遵守服务条款、行为规范和法律条款</p>
              </div>
            </div>
            <div class="checklist-item">
              <div class="checklist-icon privacy">🔒</div>
              <div class="checklist-content">
                <strong>我了解隐私政策</strong>
                <p>知悉信息收集、使用、保护的相关规定</p>
              </div>
            </div>
            <div class="checklist-item">
              <div class="checklist-icon responsibility">⚠️</div>
              <div class="checklist-content">
                <strong>我承担使用责任</strong>
                <p>对账户下所有活动负责，因 AI 回复产生的后果自行承担</p>
              </div>
            </div>
            <div class="checklist-item">
              <div class="checklist-icon community">🏘️</div>
              <div class="checklist-content">
                <strong>我愿加入社区</strong>
                <p>愿意参与社区交流，获取帮助，与其他用户互动</p>
              </div>
            </div>
          </div>

          <div class="final-agreement">
            <el-checkbox v-model="agreed" size="large" class="agreement-checkbox">
              <span class="agreement-text">我已阅读并同意</span>
              <span class="agreement-link">《用户协议》</span>
              <span>和</span>
              <span class="agreement-link">《隐私政策》</span>
            </el-checkbox>
          </div>

          <div class="start-info">
            <p>点击"开始使用"即表示您同意上述所有条款，开始愉快的聊天之旅！</p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="footer-left">
          <el-button v-if="currentStep > 0" @click="currentStep--" class="back-btn">
            <span>←</span> 上一步
          </el-button>
        </div>
        <div class="footer-center">
          <div class="step-indicator">
            <div
              v-for="(_, index) in progressSteps"
              :key="index"
              :class="['indicator-dot', { active: index === currentStep, completed: index < currentStep }]"
            />
          </div>
        </div>
        <div class="footer-right">
          <el-button v-if="currentStep < progressSteps.length - 1" @click="currentStep++" type="primary" class="next-btn">
            下一步 <span>→</span>
          </el-button>
          <el-button
            v-else
            type="primary"
            :disabled="!agreed"
            @click="handleConfirm"
            class="start-btn"
          >
            确认并开始使用
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(false)
const agreed = ref(false)
const currentStep = ref(0)
const agreementTab = ref('general')
const privacyTab = ref('collection')

const progressSteps = ['欢迎', '注意事项', '用户协议', '隐私政策', '加入社区', '确认']

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    agreed.value = false
    currentStep.value = 0
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleConfirm = () => {
  if (!agreed.value) return
  localStorage.setItem('user_agreement_accepted', 'true')
  localStorage.setItem('agreement_accepted_at', new Date().toISOString())
  visible.value = false
  emit('confirm')
}
</script>

<style scoped>
/* Dialog base styles */
:deep(.el-dialog) {
  border-radius: 20px;
  max-height: 90vh;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  padding: 20px 24px 0;
  margin-right: 0;
}

:deep(.el-dialog__headerbtn) {
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  font-size: 18px;
}

:deep(.el-dialog__body) {
  padding: 0;
  overflow: hidden;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 20px;
  border-top: 1px solid #e2e8f0;
}

:deep(.el-dialog.is-align-center .el-dialog) {
  margin: 8vh auto !important;
}

/* Header */
.dialog-header {
  padding-bottom: 16px;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.brand-icon {
  font-size: 40px;
}

.brand-text h2 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-text p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

/* Progress Steps */
.progress-steps {
  display: flex;
  gap: 8px;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #f1f5f9;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.step:hover {
  background: #e2e8f0;
}

.step.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.step.current {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.step-number {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.step.active .step-number {
  background: rgba(255,255,255,0.3);
}

.step-label {
  font-size: 13px;
  font-weight: 500;
}

/* Content */
.welcome-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 20px 24px;
}

.welcome-content::-webkit-scrollbar {
  width: 6px;
}

.welcome-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.step-content {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Welcome Hero */
.welcome-hero {
  text-align: center;
  padding: 20px 0 30px;
}

.hero-illustration {
  font-size: 64px;
  margin-bottom: 16px;
}

.welcome-hero h3 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
}

.welcome-hero p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

/* Info Cards */
.info-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.info-card {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #fff;
  transition: all 0.3s;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.info-card.safety { border-left: 4px solid #ef4444; }
.info-card.ai { border-left: 4px solid #f59e0b; }
.info-card.community { border-left: 4px solid #10b981; }
.info-card.responsibility { border-left: 4px solid #6366f1; }

.info-card .card-icon {
  font-size: 28px;
}

.info-card .card-content h4 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.info-card .card-content p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

/* Quick Tips */
.quick-tips {
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border: 1px solid #c7d2fe;
  border-radius: 14px;
  padding: 18px;
}

.quick-tips h4 {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: #4338ca;
  display: flex;
  align-items: center;
  gap: 8px;
}

.quick-tips ul {
  margin: 0;
  padding-left: 20px;
}

.quick-tips li {
  margin: 8px 0;
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
}

.quick-tips code {
  background: rgba(99, 102, 241, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #4338ca;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.section-icon {
  font-size: 36px;
}

.section-title h3 {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.section-title p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

/* Notice Grid */
.notice-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.notice-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid;
}

.notice-item.danger {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border-color: #fecaca;
}

.notice-item.warning {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-color: #fde68a;
}

.notice-item.info {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-color: #bfdbfe;
}

.notice-item.primary {
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  border-color: #c4b5fd;
}

.notice-item.success {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-color: #bbf7d0;
}

.notice-item.purple {
  background: linear-gradient(135deg, #faf5ff, #f3e8ff);
  border-color: #e9d5ff;
}

.notice-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.notice-body h4 {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.notice-body p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.6;
}

/* Security Tips */
.security-tips {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
}

.security-tips h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tips-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #475569;
}

.tip-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #10b981;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  flex-shrink: 0;
}

/* Tabs */
:deep(.el-tabs__header) {
  margin-bottom: 16px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

:deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

:deep(.el-tabs__item.is-active) {
  color: #667eea;
}

:deep(.el-tabs__active-bar) {
  height: 3px;
  border-radius: 3px;
}

/* Agreement Blocks */
.agreement-block {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.agreement-block:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.agreement-block h4 {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.agreement-block p {
  margin: 0 0 10px;
  font-size: 13px;
  color: #475569;
  line-height: 1.7;
}

.agreement-block ul {
  margin: 8px 0;
  padding-left: 20px;
}

.agreement-block li {
  margin: 6px 0;
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
}

.version-info {
  display: flex;
  gap: 20px;
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08));
  border-radius: 8px;
  font-size: 12px;
  color: #64748b;
}

.note {
  color: #94a3b8;
  font-style: italic;
}

.highlight-box {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  border: 1px solid #fb923c;
  border-radius: 10px;
}

.highlight-icon {
  font-size: 24px;
}

.highlight-box p {
  margin: 0;
}

/* Prohibited List */
.prohibited-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prohibited-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #fef2f2;
  border-radius: 8px;
  font-size: 13px;
  color: #991b1b;
}

.prohibited-icon {
  font-size: 16px;
}

/* Penalty Levels */
.penalty-levels {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.penalty-level {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 13px;
  color: #475569;
}

.level-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.level-badge.warning { background: #fef3c7; color: #b45309; }
.level-badge.danger { background: #fee2e2; color: #dc2626; }
.level-badge.serious { background: #fce7f3; color: #be185d; }
.level-badge.critical { background: #991b1b; color: #fff; }

/* AI Warning Box */
.ai-warning-box {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: linear-gradient(135deg, #fff7ed, #fef3c7);
  border: 1px solid #f59e0b;
  border-radius: 10px;
  margin-bottom: 14px;
}

.warning-icon {
  font-size: 24px;
}

/* Quota Info */
.quota-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 12px 0;
}

.quota-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 8px;
}

.quota-label {
  font-size: 13px;
  color: #64748b;
}

.quota-value {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

/* Privacy Sections */
.privacy-section {
  margin-bottom: 24px;
}

.privacy-section h4 {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

/* Data Cards */
.data-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.data-card {
  padding: 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  text-align: center;
}

.data-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.data-card h5 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.data-card p {
  margin: 0 0 8px;
  font-size: 12px;
  color: #64748b;
}

.data-purpose {
  font-size: 11px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 10px;
  border-radius: 10px;
}

/* Cookie Types */
.cookie-types {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cookie-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 10px;
}

.cookie-badge {
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.cookie-badge.necessary { background: #dcfce7; color: #166534; }
.cookie-badge.analytics { background: #dbeafe; color: #1e40af; }
.cookie-badge.marketing { background: #fce7f3; color: #9d174d; }

.cookie-info strong {
  display: block;
  font-size: 13px;
  color: #334155;
}

.cookie-info p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
}

.cookie-note {
  margin-top: 12px;
  font-size: 12px;
  color: #94a3b8;
}

/* Usage Grid */
.usage-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.usage-item {
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
  text-align: center;
}

.usage-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.usage-item h5 {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.usage-item p {
  margin: 0;
  font-size: 11px;
  color: #64748b;
}

/* Share Scenarios */
.share-scenarios {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.share-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 10px;
}

.share-icon {
  font-size: 20px;
}

.share-content strong {
  display: block;
  font-size: 13px;
  color: #334155;
}

.share-content p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
}

/* Security Measures */
.security-measures {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.measure-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.measure-icon {
  font-size: 24px;
}

.measure-text strong {
  display: block;
  font-size: 13px;
  color: #334155;
}

.measure-text p {
  margin: 4px 0 0;
  font-size: 11px;
  color: #64748b;
}

/* Retention Table */
.retention-table {
  background: #f8fafc;
  border-radius: 10px;
  overflow: hidden;
}

.retention-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid #e2e8f0;
}

.retention-row:last-child {
  border-bottom: none;
}

.retention-type {
  font-size: 13px;
  color: #475569;
}

.retention-period {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

/* Rights Grid */
.rights-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.right-item {
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
  text-align: center;
}

.right-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 8px;
}

.right-item strong {
  display: block;
  font-size: 13px;
  color: #334155;
  margin-bottom: 4px;
}

.right-item p {
  margin: 0;
  font-size: 11px;
  color: #64748b;
}

/* Children Warning */
.children-warning {
  display: flex;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1px solid #fecaca;
  border-radius: 12px;
}

.children-warning .warning-icon {
  font-size: 32px;
}

.children-warning p {
  margin: 0 0 8px;
  font-size: 13px;
  color: #7f1d1d;
}

.children-warning p:last-child {
  margin-bottom: 0;
}

/* Contact Methods */
.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 10px;
}

.contact-icon {
  font-size: 28px;
}

.contact-info strong {
  display: block;
  font-size: 14px;
  color: #334155;
}

.contact-info p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
}

/* Community Section */
.section-icon.community {
  color: #667eea;
}

.community-intro {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border: 1px solid #c7d2fe;
  border-radius: 14px;
  margin-bottom: 20px;
}

.intro-icon {
  font-size: 48px;
}

.intro-text h4 {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
}

.intro-text p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.community-benefits {
  margin-bottom: 20px;
}

.community-benefits h4,
.community-channels h4,
.community-rules h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.benefit-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.benefit-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.benefit-content strong {
  display: block;
  font-size: 14px;
  color: #334155;
  margin-bottom: 4px;
}

.benefit-content p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.channels-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 10px;
  transition: all 0.2s;
}

.channel-item:hover {
  background: #f1f5f9;
}

.channel-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.channel-icon.official {
  color: #667eea;
}

.channel-content {
  flex: 1;
}

.channel-content strong {
  display: block;
  font-size: 14px;
  color: #334155;
  margin-bottom: 2px;
}

.channel-content p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.community-rules h4 {
  margin-bottom: 12px;
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.rule-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
}

.rule-item.allowed {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1px solid #bbf7d0;
}

.rule-item.prohibited {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1px solid #fecaca;
}

.rule-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.rule-content strong {
  display: block;
  font-size: 14px;
  color: #334155;
  margin-bottom: 4px;
}

.rule-content p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.join-community {
  margin-top: 20px;
}

.join-card {
  display: flex;
  gap: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.join-qr {
  text-align: center;
  flex-shrink: 0;
}

.qr-placeholder {
  width: 100px;
  height: 100px;
  background: #fff;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin-bottom: 8px;
}

.join-qr p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.join-links {
  flex: 1;
}

.join-links h5 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;
}

.link-item:last-child {
  border-bottom: none;
}

.link-icon {
  font-size: 20px;
}

.link-text {
  flex: 1;
  font-size: 13px;
  color: #475569;
}

.join-note {
  margin: 12px 0 0;
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
}

/* Confirm Section */
.confirm-section {
  padding: 10px 0;
}

.confirm-hero {
  text-align: center;
  padding: 20px 0 24px;
}

.hero-icon {
  font-size: 56px;
  margin-bottom: 14px;
}

.confirm-hero h3 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
}

.confirm-hero p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.confirm-checklist {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.confirm-checklist .checklist-item:last-child:nth-child(odd) {
  grid-column: span 1;
}

.checklist-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.checklist-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.checklist-content strong {
  display: block;
  font-size: 14px;
  color: #334155;
  margin-bottom: 4px;
}

.checklist-content p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.final-agreement {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 14px;
  margin-bottom: 16px;
}

.agreement-text {
  font-size: 14px;
  color: #475569;
}

.agreement-link {
  color: #667eea;
  font-weight: 500;
  cursor: pointer;
}

.agreement-link:hover {
  text-decoration: underline;
}

.start-info {
  text-align: center;
}

.start-info p {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
}

/* Footer */
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-left,
.footer-right {
  flex: 1;
}

.footer-right {
  text-align: right;
}

.footer-center {
  flex: 0 0 auto;
}

.step-indicator {
  display: flex;
  gap: 6px;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e2e8f0;
  transition: all 0.3s;
}

.indicator-dot.active {
  background: #667eea;
  width: 20px;
  border-radius: 4px;
}

.indicator-dot.completed {
  background: #10b981;
}

.back-btn,
.next-btn,
.start-btn {
  border-radius: 10px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.3s;
}

.next-btn,
.start-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.next-btn:hover,
.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.start-btn:disabled {
  background: #cbd5e1;
  box-shadow: none;
}
</style>