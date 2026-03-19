'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Trophy, Medal, Star, Award } from 'lucide-react';
import { firebaseDB } from '@/lib/firebase-db';

interface DailyAwardsProps {
  groupId: string;
  date: string;
  userEmail: string;
  group: any;
}

interface AwardRecord {
  date: string;
  bestPerformerGroup?: string;
  runnerUpBestPerformerGroup?: string;
  bestImprovedGroup?: string;
  runnerUpBestImprovedGroup?: string;
  bestPerformer?: string;
  bestPerformerRunnerUp?: string;
  bestImproved?: string;
  bestImprovedRunnerUp?: string;
  notes?: string;
  awardedBy?: string;
}

export default function DailyAwards({ groupId, date, userEmail, group }: DailyAwardsProps) {
  const [awards, setAwards] = useState({
    bestPerformerGroup: '',
    runnerUpBestPerformerGroup: '',
    bestImprovedGroup: '',
    runnerUpBestImprovedGroup: '',
    bestPerformer: '',
    bestPerformerRunnerUp: '',
    bestImproved: '',
    bestImprovedRunnerUp: '',
    notes: '', // Daily notes for awards
  });
  
  const [awardsHistory, setAwardsHistory] = useState<AwardRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);

  // Check if user is teacher or special leader
  useEffect(() => {
    const masterEmail = process.env.NEXT_PUBLIC_MASTER_TEACHER_EMAIL?.toLowerCase();
    const isMaster = userEmail.toLowerCase() === masterEmail;
    const isGroupTeacher = group?.teacherEmails?.some((e: string) => 
      e.toLowerCase() === userEmail.toLowerCase()
    );
    
    // Check if user is a special leader
    const checkSpecialLeader = async () => {
      try {
        const leaders = await firebaseDB.getGroupLeaders(groupId);
        const isSpecialLeader = leaders.some((leader: any) => 
          leader.email.toLowerCase() === userEmail.toLowerCase()
        );
        setIsTeacher(isMaster || isGroupTeacher || isSpecialLeader);
      } catch (error) {
        console.error('Error checking leader status:', error);
        setIsTeacher(isMaster || isGroupTeacher);
      }
    };
    
    checkSpecialLeader();
  }, [userEmail, group, groupId]);

  // Load awards data
  useEffect(() => {
    loadAwards();
    loadAwardsHistory();
  }, [groupId, date]);

  const loadAwardsHistory = async () => {
    try {
      const history = await firebaseDB.getAllDailyAwards(groupId);
      setAwardsHistory(history);
    } catch (error) {
      console.error('Error loading awards history:', error);
    }
  };

  const loadAwards = async () => {
    setIsLoading(true);
    try {
      const existingAwards = await firebaseDB.getDailyAwards(groupId, date);
      if (existingAwards) {
        setAwards({
          bestPerformerGroup: existingAwards.bestPerformerGroup || '',
          runnerUpBestPerformerGroup: existingAwards.runnerUpBestPerformerGroup || '',
          bestImprovedGroup: existingAwards.bestImprovedGroup || '',
          runnerUpBestImprovedGroup: existingAwards.runnerUpBestImprovedGroup || '',
          bestPerformer: existingAwards.bestPerformer || '',
          bestPerformerRunnerUp: existingAwards.bestPerformerRunnerUp || '',
          bestImproved: existingAwards.bestImproved || '',
          bestImprovedRunnerUp: existingAwards.bestImprovedRunnerUp || '',
          notes: existingAwards.notes || '',
        });
      }
    } catch (error) {
      console.error('Error loading awards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await firebaseDB.saveDailyAwards(groupId, date, awards, userEmail);
      alert('Awards saved successfully!');
      // Reload history after saving
      await loadAwardsHistory();
    } catch (error) {
      console.error('Error saving awards:', error);
      alert('Failed to save awards');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setAwards(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-3 text-sm text-muted-foreground">Loading awards...</span>
      </div>
    );
  }

  if (!isTeacher) {
    return (
      <Card className="p-6 text-center">
        <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Only teachers and special leaders can manage daily awards</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Selector */}
      <Card className="p-4 sm:p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Daily Awards
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {new Date(date).toLocaleDateString('en-GB', { 
                  weekday: 'long',
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Change date to view/edit awards for different days
          </div>
        </div>
      </Card>

      {/* Awards History Summary */}
      {(awards.bestPerformerGroup || awards.bestPerformer || awards.bestImproved || awards.bestImprovedGroup) && (
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">
              Awards Given on {new Date(date).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {awards.bestPerformerGroup && (
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <span className="font-medium">Best Group:</span>
                <span className="text-yellow-700 dark:text-yellow-300">{awards.bestPerformerGroup}</span>
              </div>
            )}
            {awards.runnerUpBestPerformerGroup && (
              <div className="flex items-center gap-2">
                <Medal className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Runner Up Group:</span>
                <span className="text-yellow-700 dark:text-yellow-300">{awards.runnerUpBestPerformerGroup}</span>
              </div>
            )}
            {awards.bestPerformer && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="font-medium">Best Performer:</span>
                <span className="text-yellow-700 dark:text-yellow-300">{awards.bestPerformer}</span>
              </div>
            )}
            {awards.bestPerformerRunnerUp && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Runner Up:</span>
                <span className="text-yellow-700 dark:text-yellow-300">{awards.bestPerformerRunnerUp}</span>
              </div>
            )}
            {awards.bestImproved && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 text-green-600">🚀</div>
                <span className="font-medium">Best Improved:</span>
                <span className="text-yellow-700 dark:text-yellow-300">{awards.bestImproved}</span>
              </div>
            )}
            {awards.bestImprovedRunnerUp && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 text-green-500">💫</div>
                <span className="font-medium">Improved Runner Up:</span>
                <span className="text-yellow-700 dark:text-yellow-300">{awards.bestImprovedRunnerUp}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Group Awards */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Group Awards</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              🏆 Best Performer Group
            </label>
            <Input
              placeholder="Enter team/group name"
              value={awards.bestPerformerGroup}
              onChange={(e) => handleInputChange('bestPerformerGroup', e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              🥈 Runner Up Best Performer Group
            </label>
            <Input
              placeholder="Enter team/group name"
              value={awards.runnerUpBestPerformerGroup}
              onChange={(e) => handleInputChange('runnerUpBestPerformerGroup', e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              📈 Best Improved Group
            </label>
            <Input
              placeholder="Enter team/group name"
              value={awards.bestImprovedGroup}
              onChange={(e) => handleInputChange('bestImprovedGroup', e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              📊 Runner Up Best Improved Group
            </label>
            <Input
              placeholder="Enter team/group name"
              value={awards.runnerUpBestImprovedGroup}
              onChange={(e) => handleInputChange('runnerUpBestImprovedGroup', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Individual Awards */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Individual Awards</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              ⭐ Best Performer
            </label>
            <Input
              placeholder="Enter student name"
              value={awards.bestPerformer}
              onChange={(e) => handleInputChange('bestPerformer', e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              🌟 Best Performer Runner Up
            </label>
            <Input
              placeholder="Enter student name"
              value={awards.bestPerformerRunnerUp}
              onChange={(e) => handleInputChange('bestPerformerRunnerUp', e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              🚀 Best Improved
            </label>
            <Input
              placeholder="Enter student name"
              value={awards.bestImproved}
              onChange={(e) => handleInputChange('bestImproved', e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              💫 Best Improved Runner Up
            </label>
            <Input
              placeholder="Enter student name"
              value={awards.bestImprovedRunnerUp}
              onChange={(e) => handleInputChange('bestImprovedRunnerUp', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Daily Notes Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Daily Notes</h3>
        </div>
        
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            📝 Notes for {new Date(date).toLocaleDateString('en-GB', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric' 
            })}
          </label>
          <textarea
            placeholder="Add any notes, observations, or comments for today..."
            value={awards.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Use this space to record important observations, feedback, or any special notes about today's session.
          </p>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline"
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          {showHistory ? 'Hide Awards History' : 'View Awards History'}
        </Button>
        
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
        >
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSaving ? 'Saving...' : 'Save Awards'}
        </Button>
      </div>

      {/* Awards History Section */}
      {showHistory && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Awards History</h3>
          </div>
          
          {awardsHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No awards given yet. Start recognizing outstanding performance!
            </p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {awardsHistory.map((record, index) => (
                <div key={index} className="border border-border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">
                      {new Date(record.date).toLocaleDateString('en-GB', { 
                        weekday: 'long',
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h4>
                    {record.awardedBy && (
                      <span className="text-xs text-muted-foreground">
                        by {record.awardedBy}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {/* Group Awards */}
                    {record.bestPerformerGroup && (
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium">Best Group:</span>
                        <span className="text-foreground">{record.bestPerformerGroup}</span>
                      </div>
                    )}
                    {record.runnerUpBestPerformerGroup && (
                      <div className="flex items-center gap-2">
                        <Medal className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Runner Up Group:</span>
                        <span className="text-foreground">{record.runnerUpBestPerformerGroup}</span>
                      </div>
                    )}
                    {record.bestImprovedGroup && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 text-green-600">📈</div>
                        <span className="font-medium">Best Improved Group:</span>
                        <span className="text-foreground">{record.bestImprovedGroup}</span>
                      </div>
                    )}
                    {record.runnerUpBestImprovedGroup && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 text-green-500">📊</div>
                        <span className="font-medium">Improved Group Runner Up:</span>
                        <span className="text-foreground">{record.runnerUpBestImprovedGroup}</span>
                      </div>
                    )}
                    
                    {/* Individual Awards */}
                    {record.bestPerformer && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium">Best Performer:</span>
                        <span className="text-foreground">{record.bestPerformer}</span>
                      </div>
                    )}
                    {record.bestPerformerRunnerUp && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Runner Up:</span>
                        <span className="text-foreground">{record.bestPerformerRunnerUp}</span>
                      </div>
                    )}
                    {record.bestImproved && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 text-green-600">🚀</div>
                        <span className="font-medium">Best Improved:</span>
                        <span className="text-foreground">{record.bestImproved}</span>
                      </div>
                    )}
                    {record.bestImprovedRunnerUp && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 text-green-500">💫</div>
                        <span className="font-medium">Improved Runner Up:</span>
                        <span className="text-foreground">{record.bestImprovedRunnerUp}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Daily Notes */}
                  {record.notes && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <div className="flex-1">
                          <span className="text-xs font-medium text-muted-foreground">Daily Notes:</span>
                          <p className="text-sm text-foreground mt-1 bg-green-50 dark:bg-green-900/20 p-2 rounded border-l-2 border-green-500">
                            {record.notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}