/**
 * @name Lurker
 * @description Mute servers and view which servers allow direct messages from the plugin's settings
 * @author RoGreat
 * @authorLink https://github.com/RoGreat
 * @version 1.0.0
 * @updateUrl https://raw.githubusercontent.com/RoGreat/Lurker/main/Lurker.plugin.js 
 * @source https://github.com/RoGreat/Lurker
 * @donate https://www.paypal.me/RoGreat
 */


module.exports = (_ => {
	const config = {
		"info": {
			"name": "Lurker",
			"author": "RoGreat",
			"version": "1.0.0",
			"description": "Mute servers and view which servers allow direct messages from the plugin's settings"
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}

		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		const UpdateMuteGuildNotificationModule = BDFDB.ModuleUtils.findByProperties("updateGuildNotificationSettings");

		const SettingsMuteGuildList = class Lurker_SettingsMuteGuildList extends BdApi.React.Component {
			componentDidMount() {
				BDFDB.LibraryModules.FolderStore.getFlattenedGuilds().filter(n => n).map(guild => {
					let isMuted = BDFDB.LibraryModules.MutedUtils.isMuted(guild.id);
					if (isMuted) 
						this.props.disabled.push(guild.id);
				});
				BDFDB.ReactUtils.forceUpdate(this);
			}
			render() {
				this.props.disabled = BDFDB.ArrayUtils.is(this.props.disabled) ? this.props.disabled : [];
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
					className: this.props.className,
					wrap: BDFDB.LibraryComponents.Flex.Wrap.WRAP,
					children: BDFDB.LibraryModules.FolderStore.getFlattenedGuilds().filter(n => n).map(guild => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						text: guild.name,
						children: BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.DOMUtils.formatClassName(this.props.guildClassName, BDFDB.disCN.settingsguild, this.props.disabled.includes(guild.id) && BDFDB.disCN.settingsguilddisabled),
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Icon, {
								guild: guild,
								size: this.props.size || BDFDB.LibraryComponents.GuildComponents.Icon.Sizes.MEDIUM,
							}),
							onClick: _ => {
								let isMuted = BDFDB.LibraryModules.MutedUtils.isMuted(guild.id);
								if (isMuted) { 
									UpdateMuteGuildNotificationModule.updateGuildNotificationSettings(guild.id, {muted: false});
									BDFDB.ArrayUtils.remove(this.props.disabled, guild.id, true);
								}
								else {
									UpdateMuteGuildNotificationModule.updateGuildNotificationSettings(guild.id, {muted: true});
									this.props.disabled.push(guild.id);
								}
								if (typeof this.props.onClick == "function") 
									this.props.onClick(this.props.disabled, this);
								BDFDB.ReactUtils.forceUpdate(this);
							}
						})
					}))
				});
			}
		};

		const SettingsMsgGuildList = class Lurker_SettingsMsgGuildList extends BdApi.React.Component {
			componentDidMount() {
				BDFDB.LibraryModules.FolderStore.getFlattenedGuilds().filter(n => n).map(guild => {
					let isMsgDisabled = BDFDB.LibraryModules.SettingsStore.isGuildRestricted(guild.id);
					if (isMsgDisabled) 
						this.props.disabled.push(guild.id);
				});
				BDFDB.ReactUtils.forceUpdate(this);
			}
			render() {
				this.props.disabled = BDFDB.ArrayUtils.is(this.props.disabled) ? this.props.disabled : [];
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
					className: this.props.className,
					wrap: BDFDB.LibraryComponents.Flex.Wrap.WRAP,
					children: BDFDB.LibraryModules.FolderStore.getFlattenedGuilds().filter(n => n).map(guild => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						text: guild.name,
						children: BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.DOMUtils.formatClassName(this.props.guildClassName, BDFDB.disCN.settingsguild, this.props.disabled.includes(guild.id) && BDFDB.disCN.settingsguilddisabled),
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Icon, {
								guild: guild,
								size: this.props.size || BDFDB.LibraryComponents.GuildComponents.Icon.Sizes.MEDIUM,
							})
						})
					}))
				});
			}
		};

		return class Lurker extends Plugin {
			onLoad() {}

			onStart() {}
			
			onStop() {}

			getSettingsPanel(collapseStates = {}) {
				return BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: BDFDB.LanguageUtils.LanguageStrings.MUTE + " " + BDFDB.LanguageUtils.LanguageStrings.SERVERS,
							collapseStates: collapseStates,
							children: BDFDB.ReactUtils.createElement(SettingsMuteGuildList, {
								className: BDFDB.disCN.marginbottom20,
							})
						}));
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: BDFDB.LanguageUtils.LanguageStrings.VIEW + " " + BDFDB.LanguageUtils.LanguageStrings.DIRECT_MESSAGES,
							collapseStates: collapseStates,
							children: BDFDB.ReactUtils.createElement(SettingsMsgGuildList, {
								className: BDFDB.disCN.marginbottom20,
							})
						}));
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
							size: BDFDB.LibraryComponents.TextElement.Sizes.SIZE_12,
							children: BDFDB.LanguageUtils.LanguageStrings.DISABLE + " " + BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ALL + " " + BDFDB.LanguageUtils.LanguageStrings.DIRECT_MESSAGES + ":"
						}));
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
							size: BDFDB.LibraryComponents.TextElement.Sizes.SIZE_12,
							children: BDFDB.LanguageUtils.LanguageStrings.USER_SETTINGS + " > " + BDFDB.LanguageUtils.LanguageStrings.PRIVACY_AND_SAFETY + " > " + BDFDB.LanguageUtils.LanguageStrings.NEW_GUILDS_DM_ALLOWED
						}));
						return settingsItems;
					}
				});
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();


