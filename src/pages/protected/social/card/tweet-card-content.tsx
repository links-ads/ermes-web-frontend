import React from 'react';

import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import TwitterIcon from '@material-ui/icons/Twitter';
import InfoIcon from '@material-ui/icons/Info';
import { HAZARD_SOCIAL_ICONS, INFORMATIVE_ICONS, ParsedTweet } from '../../../../utils/utils.common'
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import { useTranslation } from 'react-i18next'
import useLanguage from '../../../../hooks/use-language.hook';

export const TweetContent = (props) => {

    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            content: {
                margin: '5px',
                padding: 5
            }
        }));

    const { t } = useTranslation(['labels'])

    const classes = useStyles();

    const {dateLocale} = useLanguage()

    const tweet = props.tweet
    let dateOptions = { hour12: false,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'} as Intl.DateTimeFormatOptions
    let formatter = new Intl.DateTimeFormat(dateLocale, dateOptions)
    let linkToProfile = "https://twitter.com/" + tweet.author.user_name;
    let informativeLabel = tweet.informative ? 'informative' : 'not_informative'
    const textSizes = props.textSizes
    const avatar = tweet.author.profile_image === undefined ? (<Avatar>
        {tweet.author.user_name[0].toUpperCase()}
    </Avatar>)
        : (<Avatar src={tweet.author.profile_image} />)

    return (
        <React.Fragment>
            <CardHeader className={classes.content} avatar={avatar}
                action={
                    <IconButton onClick={(evt) => {
                        evt.stopPropagation()
                        evt.preventDefault()
                        window.open(linkToProfile + "/status/" + tweet.id_str)
                    }}>
                        <TwitterIcon />
                    </IconButton>
                }
                title={tweet.author.display_name}
                subheader={<div><Typography variant={textSizes.subheader} display="inline" style={{ cursor: 'pointer' }}
                    onClick={(evt) => {
                        evt.stopPropagation()
                        evt.preventDefault()
                        window.open(linkToProfile)
                    }} color="secondary">@{tweet.author.user_name}</Typography>
                    <Typography variant={textSizes.subheader} display="inline"> - {formatter.format(new Date(tweet.created_at))}</Typography></div>}
            />
            <CardContent className={classes.content}>
                <ParsedTweet
                    text={tweet.text}
                    textSizes={textSizes}
                />
            </CardContent>
            <CardContent className={classes.content}>
                {(Object.entries(props.mapIdsToHazards).length > 0) && tweet.hazard_types.map(hazard => {
                    let hazardName = props.mapIdsToHazards[hazard.label_id]
                    return (<Chip
                        avatar={<Avatar>{HAZARD_SOCIAL_ICONS[hazardName]}</Avatar>}
                        size={props.chipSize}
                        key={hazard.label_id} label={t("labels:" + hazardName)} style={{ margin: '3px' }} />)
                })}
                {
                    (Object.entries(props.mapIdsToInfos).length > 0) && tweet.information_types.map(info => (<Chip key={info.label_id} style={{ margin: '3px' }} size={props.chipSize} label={t("labels:" + props.mapIdsToInfos[info.label_id])}
                        avatar={<Avatar><InfoIcon /></Avatar>}></Chip>))
                }
                {
                    <Chip key={0} style={{ margin: '3px' }} size={props.chipSize} avatar={<Avatar>{INFORMATIVE_ICONS[informativeLabel]}</Avatar>} label={t("labels:" + informativeLabel)}></Chip>
                }
            </CardContent>
        </React.Fragment>
    );
}