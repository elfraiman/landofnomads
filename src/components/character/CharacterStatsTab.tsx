import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Character, StatType } from '../../types';
import { calculateCombatStats, spendStatPoint, calculateEquipmentBonuses } from '../../utils/combatEngine';
import { useGame } from '../../context/GameContext';
import { useCustomAlert } from '../ui/CustomAlert';
import { Colors, ColorUtils, RPGTextStyles } from '../../utils/colors';
import { StatusBar } from '../ui/StatusBar';

interface CharacterStatsTabProps {
  character: Character;
}

const CharacterStatsTab: React.FC<CharacterStatsTabProps> = ({ character }) => {
  const { updateCharacter, saveGame, healCharacter, getExperienceForLevel, getExperiencePercentage, getExperienceToNextLevel } = useGame();
  const { showAlert, AlertComponent } = useCustomAlert();

  const combatStats = calculateCombatStats(character);
  const equipmentBreakdown = calculateEquipmentBonuses(character);
  const experienceForNextLevel = getExperienceForLevel(character.level + 1);
  const experienceProgress = getExperiencePercentage(character);

  const handleSpendStatPoint = (statType: StatType) => {
    if (character.unspentStatPoints <= 0) {
      showAlert('No Points Available', 'You have no unspent stat points to distribute.');
      return;
    }

    const updatedCharacter = spendStatPoint(character, statType);
    updateCharacter(updatedCharacter);
    saveGame();
  };

  const getStatIcon = (statType: StatType): string => {
    return '';
  };

  const getStatColor = (statType: StatType): string => {
    return ColorUtils.getClassColor(statType as any) || Colors.textSecondary;
  };

  const getStatDescription = (statType: StatType): string => {
    switch (statType) {
      case 'strength': return 'Increases physical damage';
      case 'dexterity': return 'Improves accuracy, crit chance, and dodge';
      case 'constitution': return 'Increases health and survivability';
      case 'intelligence': return 'Boosts magic damage and mana';
      case 'speed': return 'Determines turn order in combat';
      default: return '';
    }
  };

  const StatItem = ({ label, value, description }: { label: string; value: number | string; description?: string }) => (
    <View style={styles.statItem}>
      <View style={styles.statHeader}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      {description && <Text style={styles.statDescription}>{description}</Text>}
    </View>
  );

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Character Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Character Overview</Text>
            <View style={styles.overviewContainer}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Name</Text>
                <Text style={styles.overviewValue}>{character.name}</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Class</Text>
                <Text style={styles.overviewValue}>{character.class.name}</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Level</Text>
                <Text style={styles.overviewValue}>{character.level}</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Total Battles</Text>
                <Text style={styles.overviewValue}>{character.wins + character.losses}</Text>
              </View>
            </View>

            {/* Developer Tools - Only visible in development mode */}
            {__DEV__ && (
              <View style={styles.devSection}>
                <Text style={styles.devSectionTitle}>Developer Tools</Text>
                <View style={styles.devButtonsContainer}>
                  <TouchableOpacity
                    style={styles.devButton}
                    onPress={() => {
                      showAlert(
                        'Developer Mode',
                        'Set character to max level (999)? This will unlock all portal destinations and give massive stat bonuses.',
                        [
                          {
                            text: 'Max Level!',
                            style: 'default',
                            onPress: () => {
                              const updatedCharacter = {
                                ...character,
                                level: 999,
                                experience: 999999999,
                                unspentStatPoints: character.unspentStatPoints + 500, // Give lots of stat points
                                gold: Math.max(character.gold, 100000), // Ensure plenty of gold
                                currentHealth: character.maxHealth, // Full heal
                                stats: {
                                  ...character.stats,
                                  strength: Math.max(character.stats.strength, 100),
                                  dexterity: Math.max(character.stats.dexterity, 100),
                                  constitution: Math.max(character.stats.constitution, 100),
                                  intelligence: Math.max(character.stats.intelligence, 100),
                                  speed: Math.max(character.stats.speed, 100)
                                }
                              };
                              updateCharacter(updatedCharacter);
                              saveGame();
                              showAlert('Developer Boost Applied!', 'Character is now max level with boosted stats, gold, and stat points!');
                            }
                          },
                          {
                            text: 'Cancel',
                            style: 'cancel'
                          }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.devButtonText}>Max Level (999)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.devButton, styles.devButtonSecondary]}
                    onPress={() => {
                      const updatedCharacter = {
                        ...character,
                        gold: character.gold + 10000,
                        unspentStatPoints: character.unspentStatPoints + 50
                      };
                      updateCharacter(updatedCharacter);
                      saveGame();
                      showAlert('Resources Added!', 'Added 10,000 gold and 50 stat points!');
                    }}
                  >
                    <Text style={styles.devButtonText}>Add Resources</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Current Health Status */}
          <StatusBar
            title="Health"
            value={`${character.currentHealth} / ${character.maxHealth} HP`}
            valueColor={
              character.currentHealth < character.maxHealth * 0.3 ? Colors.error :
                character.currentHealth < character.maxHealth * 0.6 ? Colors.warning : Colors.success
            }
            percentage={(character.currentHealth / character.maxHealth) * 100}
            fillColor={
              character.currentHealth < character.maxHealth * 0.3 ? Colors.error :
                character.currentHealth < character.maxHealth * 0.6 ? Colors.warning : Colors.success
            }
            bottomText={`${Math.round((character.currentHealth / character.maxHealth) * 100)}%`}
          />

          {/* Healing Options */}
          <View style={styles.healingOptions}>
            {character.currentHealth < character.maxHealth && (
              <TouchableOpacity
                style={[
                  styles.healButton,
                  character.gold < Math.max(10, Math.floor((character.maxHealth - character.currentHealth) * 0.5)) && styles.healButtonDisabled
                ]}
                onPress={() => {
                  const healCost = Math.max(10, Math.floor((character.maxHealth - character.currentHealth) * 0.5));

                  if (character.gold >= healCost) {
                    showAlert(
                      'Healing Services',
                      `Restore your health to full for ${healCost} gold?\n\nCurrent: ${character.currentHealth}/${character.maxHealth} HP\nAfter healing: ${character.maxHealth}/${character.maxHealth} HP\n\nCost: ${healCost} gold\nYour gold: ${character.gold}`,
                      [
                        {
                          text: 'Heal',
                          style: 'default',
                          onPress: () => {
                            const updatedCharacter = {
                              ...character,
                              currentHealth: character.maxHealth,
                              gold: character.gold - healCost
                            };
                            updateCharacter(updatedCharacter);
                            saveGame();
                            showAlert('Healed!', 'Your wounds have been completely healed!');
                          }
                        },
                        {
                          text: 'Cancel',
                          style: 'cancel'
                        }
                      ]
                    );
                  } else {
                    showAlert('Insufficient Gold', `You need ${healCost} gold to heal, but you only have ${character.gold} gold.`);
                  }
                }}
                disabled={character.gold < Math.max(10, Math.floor((character.maxHealth - character.currentHealth) * 0.5))}
              >
                <Text style={[
                  styles.healButtonText,
                  character.gold < Math.max(10, Math.floor((character.maxHealth - character.currentHealth) * 0.5)) && styles.healButtonTextDisabled
                ]}>
                  Heal ({Math.max(10, Math.floor((character.maxHealth - character.currentHealth) * 0.5))}g)
                </Text>
              </TouchableOpacity>
            )}
            {character.currentHealth >= character.maxHealth && (
              <View style={styles.fullHealthContainer}>
                <Text style={styles.fullHealthText}>
                  Your health is already at maximum!
                </Text>
              </View>
            )}
          </View>
          {character.currentHealth < character.maxHealth * 0.5 && (
            <View style={styles.healthWarning}>
              <Text style={styles.healthWarningText}>
                Warning: Low Health! Consider healing or resting in the wilderness.
              </Text>
            </View>
          )}

          {/* Experience Progress */}
          <StatusBar
            title="Experience"
            value={`Lv${character.level} • ${character.experience} XP`}
            valueColor={Colors.experience}
            percentage={experienceProgress}
            fillColor={Colors.experience}
            bottomText={`${getExperienceToNextLevel(character)} XP to Lv${character.level + 1}`}
          />
        </View>

        {/* Enhanced Combat Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Combat Statistics</Text>
          <Text style={styles.sectionSubtitle}>Your effective combat performance</Text>
          <View style={styles.combatStatsContainer}>
            <View style={styles.combatStatsGrid}>
              {(() => {
                return (
                  <>
                    <View style={styles.combatStatItem}>
                      <Text style={styles.combatStatLabel}>Damage</Text>
                      <Text style={styles.combatStatValue}>{combatStats.damage}</Text>
                      {equipmentBreakdown.equipmentBonuses.damage > 0 && (
                        <Text style={styles.combatStatBonus}>
                          +{equipmentBreakdown.equipmentBonuses.damage} weapon
                        </Text>
                      )}
                    </View>
                    <View style={styles.combatStatItem}>
                      <Text style={styles.combatStatLabel}>Armor</Text>
                      <Text style={styles.combatStatValue}>{combatStats.armor}</Text>
                      {equipmentBreakdown.equipmentBonuses.armor > 0 && (
                        <Text style={styles.combatStatBonus}>
                          +{equipmentBreakdown.equipmentBonuses.armor} equipment
                        </Text>
                      )}
                    </View>
                    <View style={styles.combatStatItem}>
                      <Text style={styles.combatStatLabel}>Accuracy</Text>
                      <Text style={styles.combatStatValue}>{combatStats.accuracy}%</Text>
                      <Text style={styles.combatStatSource}>from DEX</Text>
                    </View>
                    <View style={styles.combatStatItem}>
                      <Text style={styles.combatStatLabel}>Dodge</Text>
                      <Text style={styles.combatStatValue}>{combatStats.dodge}%</Text>
                      {equipmentBreakdown.equipmentBonuses.dodgeChance > 0 ? (
                        <Text style={styles.combatStatBonus}>
                          +{equipmentBreakdown.equipmentBonuses.dodgeChance}% equipment
                        </Text>
                      ) : (
                        <Text style={styles.combatStatSource}>from DEX</Text>
                      )}
                    </View>
                    <View style={styles.combatStatItem}>
                      <Text style={styles.combatStatLabel}>Critical</Text>
                      <Text style={styles.combatStatValue}>{combatStats.criticalChance}%</Text>
                      {equipmentBreakdown.equipmentBonuses.criticalChance > 0 ? (
                        <Text style={styles.combatStatBonus}>
                          +{equipmentBreakdown.equipmentBonuses.criticalChance}% equipment
                        </Text>
                      ) : (
                        <Text style={styles.combatStatSource}>from DEX</Text>
                      )}
                    </View>
                    <View style={styles.combatStatItem}>
                      <Text style={styles.combatStatLabel}>Block</Text>
                      <Text style={styles.combatStatValue}>{equipmentBreakdown.equipmentBonuses.blockChance}%</Text>
                      {equipmentBreakdown.equipmentBonuses.blockChance > 0 ? (
                        <Text style={styles.combatStatBonus}>
                          +{equipmentBreakdown.equipmentBonuses.blockChance}% shield
                        </Text>
                      ) : (
                        <Text style={styles.combatStatSource}>no shield</Text>
                      )}
                    </View>
                    <View style={styles.combatStatItem}>
                      <Text style={styles.combatStatLabel}>Speed</Text>
                      <Text style={styles.combatStatValue}>{combatStats.speed}</Text>
                      <Text style={styles.combatStatSource}>from SPD + DEX</Text>
                    </View>
                  </>
                );
              })()}
            </View>
            <Text style={styles.combatStatsNote}>
              Green values show equipment bonuses • Stats calculated from base attributes + equipment
            </Text>
          </View>
        </View>

        {/* Unspent Stat Points */}
        {character.unspentStatPoints > 0 && (
          <View style={styles.section}>
            <View style={styles.unspentContainer}>
              <Text style={styles.unspentTitle}>
                {character.unspentStatPoints} Stat Points Available!
              </Text>
              <Text style={styles.unspentSubtext}>
                Tap the + buttons below to distribute your points
              </Text>
            </View>
          </View>
        )}

        {/* Enhanced Stats Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Character Statistics</Text>
          <Text style={styles.sectionSubtitle}>Base stats + Equipment bonuses = Total</Text>
          <View style={styles.statsGrid}>
            {(() => {
              return Object.entries(equipmentBreakdown.baseStats).map(([statType, baseValue]) => {
                const statColor = getStatColor(statType as StatType);
                const equipmentBonus = equipmentBreakdown.equipmentStats[statType as keyof typeof equipmentBreakdown.equipmentStats];
                const totalValue = equipmentBreakdown.totalStats[statType as keyof typeof equipmentBreakdown.totalStats];

                return (
                  <View key={statType} style={styles.statRow}>
                    <View style={styles.statInfo}>
                      <View style={styles.statHeader}>
                        <Text style={[styles.statIcon, { color: statColor }]}>
                          {getStatIcon(statType as StatType)}
                        </Text>
                        <Text style={[styles.statName, { color: statColor }]}>
                          {statType.charAt(0).toUpperCase() + statType.slice(1)}
                        </Text>
                        <View style={styles.statBreakdown}>
                          <Text style={[styles.baseStatValue, { color: statColor }]}>
                            {baseValue}
                          </Text>
                          {equipmentBonus !== 0 && (
                            <>
                              <Text style={styles.statOperator}>+</Text>
                              <Text style={styles.equipmentBonus}>
                                {equipmentBonus}
                              </Text>
                              <Text style={styles.statOperator}>=</Text>
                            </>
                          )}
                          <Text style={[styles.totalStatValue, { color: statColor }]}>
                            {totalValue}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.statDescription, { color: statColor }]}>
                        {getStatDescription(statType as StatType)}
                      </Text>
                      {equipmentBonus !== 0 && (
                        <Text style={styles.equipmentNote}>
                          +{equipmentBonus} from equipment
                        </Text>
                      )}
                    </View>

                    {/* Add Point Button */}
                    {character.unspentStatPoints > 0 && (
                      <TouchableOpacity
                        style={[styles.addButton, { borderColor: statColor }]}
                        onPress={() => handleSpendStatPoint(statType as StatType)}
                      >
                        <Text style={[styles.addButtonText, { color: statColor }]}>
                          +
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              });
            })()}
          </View>
        </View>

        {/* Combat Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Combat Effectiveness</Text>
          <View style={styles.statsGrid}>
            <StatItem
              label="Health"
              value={combatStats.health}
              description="Total hit points in combat"
            />
            <StatItem
              label="Damage"
              value={combatStats.damage}
              description="Base damage per attack"
            />
            <StatItem
              label="Armor"
              value={combatStats.armor}
              description="Damage reduction from equipment"
            />
            <StatItem
              label="Accuracy"
              value={`${combatStats.accuracy}%`}
              description="Chance to hit opponents"
            />
            <StatItem
              label="Dodge"
              value={`${combatStats.dodge}%`}
              description="Chance to avoid attacks"
            />
            <StatItem
              label="Critical"
              value={`${combatStats.criticalChance}%`}
              description="Chance for double damage"
            />
            <StatItem
              label="Block"
              value={`${equipmentBreakdown.equipmentBonuses.blockChance}%`}
              description="Chance to block attacks with shield"
            />
          </View>
        </View>

        {/* Equipment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment Status</Text>
          <View style={styles.equipmentSummary}>
            {Object.entries(character.equipment).map(([slot, item]) => (
              <View key={slot} style={styles.equipmentSlot}>
                <Text style={styles.equipmentSlotName}>
                  {slot.charAt(0).toUpperCase() + slot.slice(1)}:
                </Text>
                <Text style={styles.equipmentSlotItem}>
                  {item ? item.name : 'Empty'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Battle Record */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Battle Record</Text>
          <View style={styles.battleRecord}>
            <View style={styles.recordItem}>
              <Text style={styles.recordLabel}>Wins</Text>
              <Text style={[styles.recordValue, { color: Colors.success }]}>{character.wins}</Text>
            </View>
            <View style={styles.recordItem}>
              <Text style={styles.recordLabel}>Losses</Text>
              <Text style={[styles.recordValue, { color: Colors.error }]}>{character.losses}</Text>
            </View>
            <View style={styles.recordItem}>
              <Text style={styles.recordLabel}>Win Rate</Text>
              <Text style={styles.recordValue}>
                {character.wins + character.losses > 0
                  ? `${Math.round((character.wins / (character.wins + character.losses)) * 100)}%`
                  : '0%'
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Combat Stats Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Combat Stats (Estimated)</Text>

          <View style={styles.combatStatsGrid}>
            <View style={styles.combatStatItem}>
              <Text style={styles.combatStatLabel}>Health</Text>
              <Text style={styles.combatStatValue}>
                {Math.floor(100 + (character.stats.constitution * 5))}
              </Text>
            </View>

            <View style={styles.combatStatItem}>
              <Text style={styles.combatStatLabel}>Base Damage</Text>
              <Text style={styles.combatStatValue}>
                {character.stats.strength + (character.stats.intelligence > character.stats.strength ? Math.floor(character.stats.intelligence * 0.8) : 0)}
              </Text>
            </View>

            <View style={styles.combatStatItem}>
              <Text style={styles.combatStatLabel}>Accuracy</Text>
              <Text style={styles.combatStatValue}>
                {Math.min(95, 50 + (character.stats.dexterity * 2))}%
              </Text>
            </View>

            <View style={styles.combatStatItem}>
              <Text style={styles.combatStatLabel}>Crit Chance</Text>
              <Text style={styles.combatStatValue}>
                {Math.floor(character.stats.dexterity / 10)}%
              </Text>
            </View>

            <View style={styles.combatStatItem}>
              <Text style={styles.combatStatLabel}>Dodge Chance</Text>
              <Text style={styles.combatStatValue}>
                {Math.floor(character.stats.dexterity / 15)}%
              </Text>
            </View>

            <View style={styles.combatStatItem}>
              <Text style={styles.combatStatLabel}>Speed</Text>
              <Text style={styles.combatStatValue}>
                {character.stats.speed}
              </Text>
            </View>
          </View>
        </View>

        {/* Build Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Build Recommendations</Text>

          <View style={styles.buildsContainer}>
            <View style={styles.buildItem}>
              <Text style={styles.buildName}>Warrior Build</Text>
              <Text style={styles.buildDescription}>
                Focus on Strength and Constitution for high damage and survivability
              </Text>
            </View>

            <View style={styles.buildItem}>
              <Text style={styles.buildName}>Rogue Build</Text>
              <Text style={styles.buildDescription}>
                Emphasize Dexterity for critical hits and dodging attacks
              </Text>
            </View>

            <View style={styles.buildItem}>
              <Text style={styles.buildName}>Mage Build</Text>
              <Text style={styles.buildDescription}>
                Prioritize Intelligence for magical damage with some Constitution
              </Text>
            </View>

            <View style={styles.buildItem}>
              <Text style={styles.buildName}>Speed Demon</Text>
              <Text style={styles.buildDescription}>
                Max Speed for always going first, with balanced other stats
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <AlertComponent />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    ...RPGTextStyles.h2,
    color: Colors.primary,
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingBottom: 5,
  },
  sectionSubtitle: {
    ...RPGTextStyles.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  overviewContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  overviewItem: {
    width: '48%',
    marginBottom: 10,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  overviewLabel: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  overviewValue: {
    ...RPGTextStyles.body,
    color: Colors.text,
    fontWeight: '700',
  },
  experienceContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.experience,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  experienceText: {
    ...RPGTextStyles.bodySmall,
    color: Colors.text,
    fontWeight: '600',
  },
  experiencePercent: {
    ...RPGTextStyles.bodySmall,
    color: Colors.experience,
    fontWeight: '700',
  },
  experienceBar: {
    height: 10,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  experienceFill: {
    height: '100%',
    backgroundColor: Colors.experience,
  },
  experienceNext: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  statsGrid: {
    gap: 10,
  },
  statItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    ...RPGTextStyles.bodySmall,
    color: Colors.text,
    fontWeight: '600',
  },
  statValue: {
    ...RPGTextStyles.body,
    color: Colors.primary,
    fontWeight: '700',
  },
  statDescription: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  equipmentSummary: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  equipmentSlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  equipmentSlotName: {
    ...RPGTextStyles.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  equipmentSlotItem: {
    ...RPGTextStyles.bodySmall,
    color: Colors.text,
    fontWeight: '500',
  },
  battleRecord: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  recordItem: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  recordLabel: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  recordValue: {
    ...RPGTextStyles.h3,
    color: Colors.text,
    fontWeight: '700',
  },
  unspentContainer: {
    backgroundColor: ColorUtils.withOpacity(Colors.warning, 0.1),
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.warning,
    alignItems: 'center',
    shadowColor: Colors.warning,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  unspentTitle: {
    ...RPGTextStyles.h3,
    color: Colors.warning,
    marginBottom: 4,
  },
  unspentSubtext: {
    ...RPGTextStyles.caption,
    color: Colors.warning,
    fontWeight: '600',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  statInfo: {
    flex: 1,
  },
  statIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  statName: {
    ...RPGTextStyles.body,
    fontWeight: '700',
    flex: 1,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginLeft: 12,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  addButtonText: {
    ...RPGTextStyles.h3,
    color: Colors.background,
  },
  combatStatsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  combatStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  combatStatItem: {
    width: '48%',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    shadowColor: Colors.background,
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  combatStatLabel: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  combatStatValue: {
    ...RPGTextStyles.body,
    color: Colors.primary,
    fontWeight: '700',
  },
  combatStatsNote: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  buildsContainer: {
    gap: 12,
  },
  buildItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  buildName: {
    ...RPGTextStyles.bodySmall,
    color: Colors.primary,
    marginBottom: 4,
    fontWeight: '700',
  },
  buildDescription: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  healthContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.health,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  healthInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthLabel: {
    ...RPGTextStyles.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  healthValue: {
    ...RPGTextStyles.h3,
    fontWeight: '700',
  },
  healthPercentage: {
    ...RPGTextStyles.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  healthBarContainer: {
    marginBottom: 8,
  },
  healthBar: {
    height: 12,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  healthFill: {
    height: '100%',
    borderRadius: 6,
  },
  healthWarning: {
    backgroundColor: ColorUtils.withOpacity(Colors.error, 0.1),
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: Colors.error,
    shadowColor: Colors.error,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  healthWarningText: {
    ...RPGTextStyles.caption,
    color: Colors.error,
    textAlign: 'center',
    fontWeight: '600',
  },
  healingOptions: {
    alignItems: 'center',
    marginTop: 8,
  },
  healButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.accent,
    shadowColor: Colors.success,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  healButtonDisabled: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  healButtonText: {
    ...RPGTextStyles.bodySmall,
    color: Colors.background,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  healButtonTextDisabled: {
    color: Colors.textMuted,
  },
  fullHealthContainer: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: Colors.accent,
    shadowColor: Colors.success,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  fullHealthText: {
    ...RPGTextStyles.bodySmall,
    color: Colors.background,
    fontWeight: '700',
    textAlign: 'center',
  },
  statBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  baseStatValue: {
    ...RPGTextStyles.body,
    fontWeight: '700',
  },
  statOperator: {
    ...RPGTextStyles.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  equipmentBonus: {
    ...RPGTextStyles.bodySmall,
    color: Colors.success,
    fontWeight: '700',
  },
  totalStatValue: {
    ...RPGTextStyles.body,
    fontWeight: '700',
  },
  equipmentNote: {
    fontSize: 10,
    color: Colors.success,
    fontStyle: 'italic',
    marginTop: 2,
    fontWeight: '600',
  },
  combatStatBonus: {
    ...RPGTextStyles.caption,
    color: Colors.success,
    fontWeight: '600',
  },
  combatStatSource: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  devSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.warning + '20',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.warning,
    shadowColor: Colors.warning,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  devSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.warning,
    marginBottom: 12,
    textAlign: 'center',
  },
  devButtonsContainer: {
    gap: 8,
  },
  devButton: {
    backgroundColor: Colors.warning,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.accent,
    shadowColor: Colors.warning,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  devButtonSecondary: {
    backgroundColor: Colors.info,
    shadowColor: Colors.info,
  },
  devButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CharacterStatsTab; 