import React from 'react';
import styles from './ComparisonVisual.module.css';

const ComparisonVisual = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.mainTitle}>Why Headless Architecture?</h2>
      
      <div className={styles.comparisonContainer}>
        {/* Traditional Approach */}
        <div className={styles.column}>
          <div className={styles.badge + ' ' + styles.badgeTraditional}>
            Traditional Libraries
          </div>
          
          <div className={styles.card + ' ' + styles.traditionalCard}>
            <div className={styles.stackTitle}> Tightly Coupled</div>
            
            <div className={styles.stackLayer + ' ' + styles.layerDisabled}>
              <div className={styles.layerIcon}></div>
              <div className={styles.layerContent}>
                <div className={styles.layerName}>Fixed UI</div>
                <div className={styles.layerDesc}>Limited customization</div>
              </div>
              <div className={styles.lockIcon}></div>
            </div>
            
            <div className={styles.coupling}> Tightly Coupled</div>
            
            <div className={styles.stackLayer + ' ' + styles.layerDisabled}>
              <div className={styles.layerIcon}></div>
              <div className={styles.layerContent}>
                <div className={styles.layerName}>Logic Layer</div>
                <div className={styles.layerDesc}>Mixed with UI code</div>
              </div>
              <div className={styles.lockIcon}></div>
            </div>
          </div>
          
          <div className={styles.limitationsList}>
            <div className={styles.limitationItem}>
              <span className={styles.limitationIcon}></span>
              <span>Fixed design & components</span>
            </div>
            <div className={styles.limitationItem}>
              <span className={styles.limitationIcon}></span>
              <span>Framework-specific</span>
            </div>
            <div className={styles.limitationItem}>
              <span className={styles.limitationIcon}></span>
              <span>Large bundle (500KB+)</span>
            </div>
            <div className={styles.limitationItem}>
              <span className={styles.limitationIcon}></span>
              <span>Difficult to test</span>
            </div>
            <div className={styles.limitationItem}>
              <span className={styles.limitationIcon}></span>
              <span>Breaking UI changes</span>
            </div>
          </div>
        </div>

        {/* VS Divider */}
        <div className={styles.vsColumn}>
          <div className={styles.vsCircle}>VS</div>
        </div>

        {/* Headless Approach */}
        <div className={styles.column}>
          <div className={styles.badge + ' ' + styles.badgeHeadless}>
            PivotHead Headless
          </div>
          
          <div className={styles.card + ' ' + styles.headlessCard}>
            <div className={styles.stackTitle}>Decoupled Architecture</div>
            
            <div className={styles.stackLayer + ' ' + styles.layerEnabled}>
              <div className={styles.layerIcon}></div>
              <div className={styles.layerContent}>
                <div className={styles.layerName}>Your Custom UI</div>
                <div className={styles.layerDesc}>Complete freedom</div>
              </div>
              <div className={styles.freedomIcon}></div>
            </div>
            
            <div className={styles.bridge}>
              <div className={styles.bridgeLabel}>Web Component Bridge</div>
              <div className={styles.bridgeArrows}>⇅</div>
            </div>
            
            <div className={styles.stackLayer + ' ' + styles.layerEnabled}>
              <div className={styles.layerIcon}></div>
              <div className={styles.layerContent}>
                <div className={styles.layerName}>Core Engine</div>
                <div className={styles.layerDesc}>Pure logic </div>
              </div>
              <div className={styles.freedomIcon}></div>
            </div>
          </div>
          
          <div className={styles.benefitsList}>
            <div className={styles.benefitItem}>
              <span className={styles.benefitIcon}></span>
              <span>100% custom design</span>
            </div>
            <div className={styles.benefitItem}>
              <span className={styles.benefitIcon}></span>
              <span>Any framework</span>
            </div>
            <div className={styles.benefitItem}>
              <span className={styles.benefitIcon}></span>
              <span>Lightweight (~50KB)</span>
            </div>
            <div className={styles.benefitItem}>
              <span className={styles.benefitIcon}></span>
              <span>Easy to test</span>
            </div>
            <div className={styles.benefitItem}>
              <span className={styles.benefitIcon}></span>
              <span>Stable core API</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div className={styles.insightBox}>
        <div className={styles.insightIcon}></div>
        <div className={styles.insightContent}>
          <h3>The Key Difference</h3>
          <p>
            Traditional libraries lock you into their UI decisions. 
            <strong> PivotHead gives you the engine and you build the UI exactly as you need it.</strong>
          </p>
        </div>
      </div>

      {/* Framework Support Visual */}
      <div className={styles.frameworkSection}>
        <h3>Works With Any Framework</h3>
        <div className={styles.frameworkGrid}>
          <div className={styles.frameworkCard}>
            <div className={styles.frameworkIconLarge}></div>
            <div className={styles.frameworkName}>React</div>
          </div>
          <div className={styles.frameworkCard}>
            <div className={styles.frameworkIconLarge}></div>
            <div className={styles.frameworkName}>Vue</div>
          </div>
          <div className={styles.frameworkCard}>
            <div className={styles.frameworkIconLarge}></div>
            <div className={styles.frameworkName}>Angular</div>
          </div>
          <div className={styles.frameworkCard}>
            <div className={styles.frameworkIconLarge}></div>
            <div className={styles.frameworkName}>Svelte</div>
          </div>
          <div className={styles.frameworkCard}>
            <div className={styles.frameworkIconLarge}></div>
            <div className={styles.frameworkName}>Vanilla JS</div>
          </div>
          <div className={styles.frameworkCard + ' ' + styles.frameworkCardFuture}>
            <div className={styles.frameworkIconLarge}></div>
            <div className={styles.frameworkName}>Future Frameworks</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsSection}>
        
        <div className={styles.statCard}>
          <div className={styles.statNumber}>100%</div>
          <div className={styles.statLabel}>Design Freedom</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>3+</div>
          <div className={styles.statLabel}>Frameworks Supported</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>1st</div>
          <div className={styles.statLabel}>Headless Pivot Engine</div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonVisual;