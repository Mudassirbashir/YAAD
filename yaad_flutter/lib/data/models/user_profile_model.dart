/// User Profile model matching Supabase `public.profiles` table.
library;

final class UserProfileModel {
  const UserProfileModel({
    required this.id,
    this.fullName,
    this.email,
    this.avatarUrl,
    this.phoneNumber,
    this.language = 'en',
    this.usagePurpose,
    this.referralSource,
    this.hasCompletedSetup = false,
    this.isVerified = false,
    this.isSuspended = false,
    this.suspendReason,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String? fullName;
  final String? email;
  final String? avatarUrl;
  final String? phoneNumber;
  final String language; // 'en' | 'roman-urdu' | 'ur'
  final String? usagePurpose;
  final String? referralSource;
  final bool hasCompletedSetup;
  final bool isVerified;
  final bool isSuspended;
  final String? suspendReason;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory UserProfileModel.fromJson(Map<String, dynamic> json) {
    DateTime? parseDate(dynamic val) {
      if (val == null) return null;
      if (val is DateTime) return val;
      if (val is String) return DateTime.tryParse(val);
      if (val is int) return DateTime.fromMillisecondsSinceEpoch(val);
      return null;
    }

    return UserProfileModel(
      id: json['id'] as String? ?? '',
      fullName: json['full_name'] as String? ?? json['fullName'] as String?,
      email: json['email'] as String?,
      avatarUrl: json['avatar_url'] as String? ?? json['avatarUrl'] as String?,
      phoneNumber: json['phone_number'] as String? ?? json['phone'] as String? ?? json['phoneNumber'] as String?,
      language: json['language'] as String? ?? 'en',
      usagePurpose: json['usage_purpose'] as String? ?? json['usagePurpose'] as String?,
      referralSource: json['referral_source'] as String? ?? json['referralSource'] as String?,
      hasCompletedSetup: json['has_completed_setup'] as bool? ?? json['hasCompletedSetup'] as bool? ?? false,
      isVerified: json['is_verified'] as bool? ?? json['isVerified'] as bool? ?? false,
      isSuspended: json['is_suspended'] as bool? ?? json['isSuspended'] as bool? ?? false,
      suspendReason: json['suspend_reason'] as String? ?? json['suspendReason'] as String?,
      createdAt: parseDate(json['created_at'] ?? json['createdAt']),
      updatedAt: parseDate(json['updated_at'] ?? json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      if (fullName != null) 'full_name': fullName,
      if (email != null) 'email': email,
      if (avatarUrl != null) 'avatar_url': avatarUrl,
      if (phoneNumber != null) 'phone_number': phoneNumber,
      if (phoneNumber != null) 'phone': phoneNumber,
      'language': language,
      if (usagePurpose != null) 'usage_purpose': usagePurpose,
      if (referralSource != null) 'referral_source': referralSource,
      'has_completed_setup': hasCompletedSetup,
      'is_verified': isVerified,
      'is_suspended': isSuspended,
      if (suspendReason != null) 'suspend_reason': suspendReason,
      if (createdAt != null) 'created_at': createdAt!.toUtc().toIso8601String(),
      if (updatedAt != null) 'updated_at': updatedAt!.toUtc().toIso8601String(),
    };
  }

  UserProfileModel copyWith({
    String? fullName,
    String? email,
    String? avatarUrl,
    String? phoneNumber,
    String? language,
    String? usagePurpose,
    String? referralSource,
    bool? hasCompletedSetup,
    bool? isVerified,
    bool? isSuspended,
    String? suspendReason,
    DateTime? updatedAt,
  }) {
    return UserProfileModel(
      id: id,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      language: language ?? this.language,
      usagePurpose: usagePurpose ?? this.usagePurpose,
      referralSource: referralSource ?? this.referralSource,
      hasCompletedSetup: hasCompletedSetup ?? this.hasCompletedSetup,
      isVerified: isVerified ?? this.isVerified,
      isSuspended: isSuspended ?? this.isSuspended,
      suspendReason: suspendReason ?? this.suspendReason,
      createdAt: createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserProfileModel && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'UserProfileModel(id: $id, name: $fullName, email: $email)';
}
